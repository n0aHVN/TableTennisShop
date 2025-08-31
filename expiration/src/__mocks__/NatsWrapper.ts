export const natsWrapper = { // Export a mock object called natsWrapper
  client: { // It has a client property (like the real NATS client)
    publish: jest // The publish method is mocked using Jest
      .fn() // Create a Jest mock function
      .mockImplementationOnce( // Provide a custom implementation for the first call
        (subject: string, data: string, callback: () => void) => {
          callback(); // When called, it just calls the callback immediately (simulates success)
        }
      ),
  },
};