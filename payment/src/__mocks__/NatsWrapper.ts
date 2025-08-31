// This wrapper will be used on routes/__test

export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementationOnce(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
