// Define the structure for each stage of the aggregation pipeline
export interface MatchStage {
  $match: {
    [key: string]: any; // You can specify the exact fields if known
  };
}

interface LookupStage {
  $lookup: {
    from: string;
    localField?: string;
    foreignField?: string;
    as: string;
    let?: { [key: string]: any };
    pipeline?: CustomPipelineStage[];
  };
}

interface UnwindStage {
  $unwind:
    | {
        path: string;
        preserveNullAndEmptyArrays?: boolean;
      }
    | string;
}

interface ProjectStage {
  $project: {
    [key: string]: string | number; // You can specify the exact fields if known
  };
}
interface GroupStage {
  $group: {
    _id: string | { [key: string]: any }; // Grouping key
    [key: string]: any; // Fields for aggregations (e.g., $sum, $avg, $max)
  };
}

interface AddFieldsStage {
  $addFields: {
    [key: string]: any; // You can specify the exact fields if known
  };
}

interface LimitStage {
  $limit: number;
}
export interface SortStage {
  $sort: {
    [key: string]: 1 | -1;
  };
}

// Union type representing a pipeline stage
export type CustomPipelineStage =
  | MatchStage
  | LookupStage
  | UnwindStage
  | ProjectStage
  | AddFieldsStage
  | GroupStage
  | LimitStage
  | SortStage;
