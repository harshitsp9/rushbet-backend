import { GAME_EVENT_TYPE } from '@/types/enums/enums.common';
import { generateObjectId } from '@/utils/commonUtils';
import { PipelineStage, Types } from 'mongoose';

//pipeline for top winner by game and date filter wise
export const generateDailySummaryPipeline = (
  userId: string | Types.ObjectId,
  limit: number,
  page: number,
  filterBy: string
) => {
  const pipeline = [
    {
      $match: {
        userId: generateObjectId(userId),
      },
    },
    {
      $addFields: {
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
      },
    },
    {
      $project: {
        amount: 1,
        userId: 1,
        eventType: 1,
        date: 1,
      },
    },
    {
      $group: {
        _id: '$date',
        // Group by date
        date: {
          $first: '$date',
        },
        totalBet: {
          $sum: {
            $cond: [
              {
                $eq: ['$eventType', GAME_EVENT_TYPE.BET],
              },
              '$amount',
              0,
            ],
          },
        },
        totalWin: {
          $sum: {
            $cond: [
              {
                $or: [
                  {
                    $eq: ['$eventType', GAME_EVENT_TYPE.WIN],
                  },
                  {
                    $eq: ['$eventType', GAME_EVENT_TYPE.CANCEL],
                  },
                ],
              },
              '$amount',
              0,
            ],
          },
        },
      },
    },
    {
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
        date: -1,
      },
    },
    {
      $addFields: {
        totalAmount: {
          $subtract: ['$totalWin', '$totalBet'],
        },
      },
    },
    {
      $project: {
        _id: 0,
        username: '$userInfo.username',
        date: 1,
        allRecord: 1,
        type: {
          $cond: {
            if: {
              $gt: ['$totalAmount', 0],
            },
            // If totalAmount is greater than 0
            then: 'won',
            // Type is 'won'
            else: 'lost', // Type is 'lost'
          },
        },
        totalBet: {
          $toString: {
            $round: ['$totalBet', 2],
          },
        },
        totalWin: {
          $toString: {
            $round: ['$totalWin', 2],
          },
        },
        totalAmount: {
          $toString: {
            $round: ['$totalAmount', 2],
          },
        },
      },
    },
  ] as PipelineStage[];
  const totalCountPipeline = [
    ...pipeline,
    ...(filterBy !== 'all' ? [{ $match: { type: filterBy } }] : []),
    { $count: 'totalRecords' },
  ];

  //if filterBy is won or lost
  if (filterBy !== 'all') {
    pipeline.push({
      $match: {
        type: filterBy,
      },
    });
  }

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
