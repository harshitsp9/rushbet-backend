import { FREEBET_STATUS, OFFER_AVAILED_STATUS, OFFER_STATUS } from '@/types/enums/enums.common';
import { generateObjectId } from '@/utils/commonUtils';
import { PipelineStage, Types } from 'mongoose';

export const generateGetOfferListPipeline = (gameId: string | Types.ObjectId, userId: string | Types.ObjectId) => {
  return [
    {
      $match: {
        gameId: generateObjectId(gameId),
        status: OFFER_STATUS.ACTIVE,
        remainingUseCount: { $gt: 0 },
      },
    },
    {
      $lookup: {
        from: 'offer-avails',
        localField: '_id',
        foreignField: 'offerId',
        as: 'offerAvailed',
        pipeline: [
          {
            // if offer found then check user has availed or not
            $match: {
              userId: generateObjectId(userId),
              status: OFFER_AVAILED_STATUS.PAID,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        availedSize: { $size: '$offerAvailed' },
      },
    },
    {
      // if not multiuse than that user availed size should be 0
      $match: {
        $or: [{ isMultiUse: false, availedSize: { $eq: 0 } }, { isMultiUse: true }],
      },
    },
    {
      $project: {
        userDesc: 1,
        helpText: 1,
        iconUrl: 1,
        code: 1,
        termsText: 1,
        minAmount: 1,
        availOn: 1,
        status: 1,
        maxAmount: 1,
        createdAt: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
};

export const generateGetMatchingOfferPipeline = (
  gameId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  amount: number | null,
  offerId: string | null
) => {
  const pipeline = generateGetOfferListPipeline(gameId, userId);

  if (amount) {
    // check given amount is greater than min amount and less than max amount
    pipeline.push({
      $match: {
        $expr: {
          $and: [
            {
              $gte: [amount, '$minAmount'],
            },
            {
              $lte: [amount, '$maxAmount'],
            },
          ],
        },
      },
    } as any);
  }

  //if offerId is passed
  if (offerId) {
    pipeline.push({
      $match: {
        _id: generateObjectId(offerId),
      } as any,
    });
  }

  return pipeline;
};

export const generateGetNearByOfferPipeline = (
  gameId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  amount: number | null,
  offerId: string | null
): PipelineStage[] => {
  const basePipeline = generateGetOfferListPipeline(gameId, userId);

  const exactMatchStages: PipelineStage[] = [];
  if (amount !== null) {
    exactMatchStages.push({
      $match: {
        $expr: {
          $and: [{ $gte: [amount, '$minAmount'] }, { $lte: [amount, '$maxAmount'] }],
        },
      },
    });
  }

  if (offerId) {
    exactMatchStages.push({
      $match: { _id: generateObjectId(offerId) },
    });
  }

  const nearestMatchStages: PipelineStage[] = [];
  if (amount !== null) {
    nearestMatchStages.push(
      {
        $match: {
          minAmount: { $gt: amount },
        },
      },
      {
        $addFields: {
          remainingAmount: {
            $round: [{ $subtract: ['$minAmount', amount] }, 2],
          },
        },
      },
      {
        $sort: { minAmount: 1 },
      },
      {
        $limit: 1,
      }
    );
  }

  return [
    ...basePipeline,
    {
      $facet: {
        exactMatch: exactMatchStages.length ? exactMatchStages : [{ $match: {} }],
        nearestMatch: nearestMatchStages.length ? nearestMatchStages : [],
      },
    },
  ] as PipelineStage[];
};

export const generateRemainingSpinCountPipeline = (userId: string | Types.ObjectId) => {
  return [
    {
      $match: {
        userId: generateObjectId(userId),
        status: FREEBET_STATUS.UNUSED,
      },
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantity' },
        totalUsed: { $sum: '$usedQuantity' },
      },
    },
    {
      $project: {
        _id: 0,
        remainingSpins: {
          $subtract: ['$totalQuantity', '$totalUsed'],
        },
      },
    },
  ];
};
