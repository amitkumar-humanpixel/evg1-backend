export class IFilterCount {
  count: number;
}

export class ResponseDTO {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class ResponseHeaders {
  name: string;
  label: string;
  type: string;
}

export class ApiResponseDTO {
  private static instance: ApiResponseDTO;
  status: string;
  message: string;
  data: any;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() { }

  private static getInstance(): ApiResponseDTO {
    if (!ApiResponseDTO.instance) {
      ApiResponseDTO.instance = new ApiResponseDTO();
    }

    return ApiResponseDTO.instance;
  }

  public static setResponse(status: string, data?: any): ApiResponseDTO {
    const response = ApiResponseDTO.getInstance();
    if (typeof data === 'string') {
      response.message = data;
      response.data = undefined;
    } else {
      response.data = data;
      response.message = undefined;
    }
    response.status = status;
    return response;
  }
}
