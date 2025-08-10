import { GAME_EVENT_TYPE } from '@/types/enums/enums.common';
import { PipelineStage, Types } from 'mongoose';

//pipeline for top winner by game and date filter wise
export const generateTopWinnerPipeline = (
  gameId: string | Types.ObjectId,
  startDate: Date,
  endDate: Date,
  limit: number,
  page: number
) => {
  const pipeline = [
    {
      $match: {
        gameId: gameId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $project: {
        amount: 1,
        userId: 1,
        eventType: 1,
      },
    },
    {
      $group: {
        _id: '$userId',
        userId: { $first: '$userId' },
        totalBet: {
          // get total bet amount
          $sum: {
            $cond: [{ $eq: ['$eventType', GAME_EVENT_TYPE.BET] }, '$amount', 0],
          },
        },
        totalWin: {
          // get total win amount
          $sum: {
            $cond: [
              {
                $or: [{ $eq: ['$eventType', GAME_EVENT_TYPE.WIN] }, { $eq: ['$eventType', GAME_EVENT_TYPE.CANCEL] }],
              },
              '$amount',
              0,
            ],
          },
        },
        totalAmount: {
          $sum: {
            $cond: [
              { $eq: ['$eventType', GAME_EVENT_TYPE.WIN] }, // If event is "win"
              '$amount', // Add the amount for "win"
              {
                $cond: [
                  { $eq: ['$eventType', GAME_EVENT_TYPE.BET] }, // If event is "bet"
                  { $multiply: ['$amount', -1] }, // Subtract the amount for "bet"
                  {
                    $cond: [
                      {
                        $eq: ['$eventType', GAME_EVENT_TYPE.CANCEL],
                      }, // If event is "cancel"
                      '$amount', // Add the amount for "cancel"
                      0, // If event is anything else, treat it as 0
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    },
    {
      //  filter those record who is positive balance
      $match: {
        totalAmount: { $gt: 0 },
      },
    },
    {
      // for get username
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    {
      $unwind: {
        path: '$userInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        totalAmount: -1,
      },
    },

    {
      $project: {
        username: '$userInfo.username',
        totalBet: {
          $toString: { $round: ['$totalBet', 2] },
        },
        totalWin: {
          $toString: { $round: ['$totalWin', 2] },
        },
        totalAmount: {
          $toString: { $round: ['$totalAmount', 2] },
        },
      },
    },
  ] as PipelineStage[];
  const totalCountPipeline = [...pipeline, { $count: 'totalRecords' }];

  if (page !== 0) {
    pipeline.push({
      $skip: (page - 1) * limit, // Skip documents based on page number
    });

    pipeline.push(
      // Pagination: Limit the number of documents to the page size
      {
        $limit: limit, // Limit the number of documents per page
      }
    );
  }

  return { pipeline, totalCountPipeline };
};
