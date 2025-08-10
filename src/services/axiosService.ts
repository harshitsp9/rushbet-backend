import axios, { AxiosRequestConfig } from 'axios';

//common axios function

const handleRequest = async (config: AxiosRequestConfig): Promise<any> => {
  try {
    const response = await axios(config);
    return response.data; // Return data if successful
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios error
      throw error;
    } else {
      // Handle non-Axios error
      console.error('api error:', error);
      throw new Error('An unknown error occurred');
    }
  }
};

export { handleRequest };
