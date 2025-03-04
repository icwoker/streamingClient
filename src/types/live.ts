export interface LiveRecord {
    id: string;
    user_id: number;
    title: string;
    cover_url: string;
    tags: string;
    stream_key: string;
    status: string;
    start_time: string;
    end_time?: string | null;
  }
  
  export interface PaginationData {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  }