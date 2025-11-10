const createMockInterceptors = () => ({
  request: {
    use: jest.fn(),
    eject: jest.fn(),
  },
  response: {
    use: jest.fn(),
    eject: jest.fn(),
  },
});

export const createMockAxiosInstance = () => ({
  interceptors: createMockInterceptors(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
});

let axiosInstance = createMockAxiosInstance();

const axios: any = jest.fn();

axios.create = jest.fn(() => axiosInstance);
axios.isAxiosError = jest.fn(() => false);
axios.AxiosError = class MockAxiosError extends Error {};
axios.create.mockReturnValue(axiosInstance);

export const __resetMockAxiosInstance = () => {
  axiosInstance = createMockAxiosInstance();
  axios.create.mockReturnValue(axiosInstance);
  return axiosInstance;
};

export const __getMockAxiosInstance = () => axiosInstance;

export default axios;


