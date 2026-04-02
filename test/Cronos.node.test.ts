/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Cronos } from '../nodes/Cronos/Cronos.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Cronos Node', () => {
  let node: Cronos;

  beforeAll(() => {
    node = new Cronos();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Cronos');
      expect(node.description.name).toBe('cronos');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Account Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://evm.cronos.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  it('should get balance successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBalance')
      .mockReturnValueOnce('0x1234567890abcdef1234567890abcdef12345678')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x1b1ae4d6e2ef500000',
      id: 1
    });

    const items = [{ json: {} }];
    const result = await executeAccountOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x1b1ae4d6e2ef500000');
  });

  it('should get transaction count successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransactionCount')
      .mockReturnValueOnce('0x1234567890abcdef1234567890abcdef12345678')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x5',
      id: 1
    });

    const items = [{ json: {} }];
    const result = await executeAccountOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x5');
  });

  it('should get contract code successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getCode')
      .mockReturnValueOnce('0x1234567890abcdef1234567890abcdef12345678')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      jsonrpc: '2.0',
      result: '0x608060405234801561001057600080fd5b50',
      id: 1
    });

    const items = [{ json: {} }];
    const result = await executeAccountOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.result).toBe('0x608060405234801561001057600080fd5b50');
  });

  it('should handle API errors gracefully when continue on fail is enabled', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBalance')
      .mockReturnValueOnce('invalid-address')
      .mockReturnValueOnce('latest');

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address format'));

    const items = [{ json: {} }];
    const result = await executeAccountOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Invalid address format');
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('unknownOperation');

    const items = [{ json: {} }];

    await expect(executeAccountOperations.call(mockExecuteFunctions, items))
      .rejects
      .toThrow('Unknown operation: unknownOperation');
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://evm.cronos.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should send raw transaction successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x123abc...'
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('sendRawTransaction')
      .mockReturnValueOnce('0xsignedtxdata...');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should get transaction by hash successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        hash: '0x123...',
        from: '0xabc...',
        to: '0xdef...',
        value: '0x0'
      }
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransaction')
      .mockReturnValueOnce('0x123...');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should get transaction receipt successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        transactionHash: '0x123...',
        status: '0x1',
        gasUsed: '0x5208'
      }
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTransactionReceipt')
      .mockReturnValueOnce('0x123...');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should estimate gas successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x5208'
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('estimateGas')
      .mockReturnValueOnce('0xabc...')
      .mockReturnValueOnce('0xdef...')
      .mockReturnValueOnce('0x0')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should get gas price successfully', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: '0x9184e72a000'
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getGasPrice');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should handle RPC errors', async () => {
    const mockErrorResponse = {
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32000,
        message: 'insufficient funds'
      }
    };

    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('sendRawTransaction')
      .mockReturnValueOnce('0xbadtx...');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

    await expect(
      executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Cronos RPC Error: insufficient funds');
  });

  it('should handle HTTP request errors', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getGasPrice');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
      new Error('Network error')
    );

    await expect(
      executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Network error');
  });

  it('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getGasPrice');

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
      new Error('Network error')
    );

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toEqual([{
      json: { error: 'Network error' },
      pairedItem: { item: 0 }
    }]);
  });
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://evm.cronos.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get latest block number successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlockNumber');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({ jsonrpc: '2.0', result: '0x1b4', id: 1 })
    );

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: { blockNumber: '0x1b4', blockNumberDecimal: 436 },
      pairedItem: { item: 0 }
    }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://evm.cronos.org',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-key'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }),
      json: false
    });
  });

  it('should get block details successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlock')
      .mockReturnValueOnce('latest')
      .mockReturnValueOnce(true);
    
    const mockBlock = {
      number: '0x1b4',
      hash: '0x1234567890abcdef',
      transactions: []
    };
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({ jsonrpc: '2.0', result: mockBlock, id: 1 })
    );

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: mockBlock,
      pairedItem: { item: 0 }
    }]);
  });

  it('should get block transaction count successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBlockTransactionCount')
      .mockReturnValueOnce('latest');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({ jsonrpc: '2.0', result: '0xa', id: 1 })
    );

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: { transactionCount: '0xa', transactionCountDecimal: 10 },
      pairedItem: { item: 0 }
    }]);
  });

  it('should handle RPC errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlockNumber');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32602, message: 'Invalid params' },
        id: 1
      })
    );

    await expect(executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]))
      .rejects.toThrow('RPC Error: Invalid params');
  });

  it('should handle network errors with continueOnFail', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBlockNumber');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: { error: 'Network error' },
      pairedItem: { item: 0 }
    }]);
  });
});

describe('SmartContract Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        baseUrl: 'https://evm.cronos.org',
        apiKey: 'test-key' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('call operation', () => {
    it('should execute contract call successfully', async () => {
      const mockTransaction = { to: '0x123...', data: '0xabc...' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('call')
        .mockReturnValueOnce(mockTransaction)
        .mockReturnValueOnce('latest');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000001'
      });

      const result = await executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://evm.cronos.org',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        body: {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [mockTransaction, 'latest'],
          id: expect.any(Number)
        },
        json: true
      });

      expect(result).toHaveLength(1);
      expect(result[0].json.result).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
    });

    it('should handle RPC error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('call')
        .mockReturnValueOnce({ to: '0x123...' })
        .mockReturnValueOnce('latest');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32000, message: 'execution reverted' }
      });

      await expect(executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]))
        .rejects.toThrow('Cronos RPC Error: execution reverted (Code: -32000)');
    });
  });

  describe('getLogs operation', () => {
    it('should get contract logs successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getLogs')
        .mockReturnValueOnce('0x1')
        .mockReturnValueOnce('latest')
        .mockReturnValueOnce('0x123...')
        .mockReturnValueOnce(['0xabc...']);

      const mockLogs = [{
        address: '0x123...',
        topics: ['0xabc...'],
        data: '0x000...',
        blockNumber: '0x1',
        transactionHash: '0xdef...'
      }];

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: mockLogs
      });

      const result = await executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://evm.cronos.org',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        body: {
          jsonrpc: '2.0',
          method: 'eth_getLogs',
          params: [{
            fromBlock: '0x1',
            toBlock: 'latest',
            address: '0x123...',
            topics: ['0xabc...']
          }],
          id: expect.any(Number)
        },
        json: true
      });

      expect(result[0].json.result).toEqual(mockLogs);
    });
  });

  describe('getStorageAt operation', () => {
    it('should get storage value successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStorageAt')
        .mockReturnValueOnce('0x123...')
        .mockReturnValueOnce('0x0')
        .mockReturnValueOnce('latest');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000001'
      });

      const result = await executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://evm.cronos.org',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        body: {
          jsonrpc: '2.0',
          method: 'eth_getStorageAt',
          params: ['0x123...', '0x0', 'latest'],
          id: expect.any(Number)
        },
        json: true
      });

      expect(result[0].json.result).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
    });
  });
});

describe('Token Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://evm.cronos.org',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getBalance operation', () => {
		it('should get token balance successfully', async () => {
			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: '0x1bc16d674ec80000',
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getBalance')
				.mockReturnValueOnce('0x1234567890123456789012345678901234567890')
				.mockReturnValueOnce('0x70a08231000000000000000000000000abcd1234567890123456789012345678901234567890')
				.mockReturnValueOnce('latest');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTokenOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://evm.cronos.org',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer test-key',
				},
				body: {
					jsonrpc: '2.0',
					method: 'eth_call',
					params: [
						{
							to: '0x1234567890123456789012345678901234567890',
							data: '0x70a08231000000000000000000000000abcd1234567890123456789012345678901234567890',
						},
						'latest',
					],
					id: 1,
				},
				json: true,
			});
		});

		it('should handle getBalance errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getBalance');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const items = [{ json: {} }];
			const result = await executeTokenOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json.error).toBe('Network error');
		});
	});

	describe('getMetadata operation', () => {
		it('should get token metadata successfully', async () => {
			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000044e616d650000000000000000000000000000000000000000000000000000000',
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getMetadata')
				.mockReturnValueOnce('0x1234567890123456789012345678901234567890')
				.mockReturnValueOnce('0x06fdde03')
				.mockReturnValueOnce('latest');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTokenOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getTransferEvents operation', () => {
		it('should get transfer events successfully', async () => {
			const mockResponse = {
				jsonrpc: '2.0',
				id: 1,
				result: [
					{
						address: '0x1234567890123456789012345678901234567890',
						topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
						data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
						blockNumber: '0x123456',
						transactionHash: '0xabcdef1234567890',
						logIndex: '0x0',
					},
				],
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransferEvents')
				.mockReturnValueOnce('0x123450')
				.mockReturnValueOnce('latest')
				.mockReturnValueOnce('0x1234567890123456789012345678901234567890')
				.mockReturnValueOnce('["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTokenOperations.call(mockExecuteFunctions, items);

			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(mockResponse);
		});

		it('should handle invalid JSON in transferTopics', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransferEvents')
				.mockReturnValueOnce('0x123450')
				.mockReturnValueOnce('latest')
				.mockReturnValueOnce('0x1234567890123456789012345678901234567890')
				.mockReturnValueOnce('invalid json');

			const items = [{ json: {} }];

			await expect(executeTokenOperations.call(mockExecuteFunctions, items))
				.rejects
				.toThrow('Invalid JSON in transferTopics');
		});
	});
});

describe('Network Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://evm.cronos.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get chain ID successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getChainId');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: '0x19',
        id: 1
      })
    );

    const items = [{ json: {} }];
    const result = await executeNetworkOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('chainId', '0x19');
    expect(result[0].json).toHaveProperty('chainIdDecimal', 25);
  });

  it('should get sync status when not syncing', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('syncing');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: false,
        id: 1
      })
    );

    const items = [{ json: {} }];
    const result = await executeNetworkOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('syncing', false);
    expect(result[0].json).toHaveProperty('message', 'Node is fully synchronized');
  });

  it('should get sync status when syncing', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('syncing');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: {
          startingBlock: '0x0',
          currentBlock: '0x1000',
          highestBlock: '0x2000'
        },
        id: 1
      })
    );

    const items = [{ json: {} }];
    const result = await executeNetworkOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('syncing', true);
    expect(result[0].json).toHaveProperty('startingBlock', '0x0');
    expect(result[0].json).toHaveProperty('currentBlock', '0x1000');
    expect(result[0].json).toHaveProperty('highestBlock', '0x2000');
  });

  it('should get protocol version successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getProtocolVersion');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        result: '0x41',
        id: 1
      })
    );

    const items = [{ json: {} }];
    const result = await executeNetworkOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('protocolVersion', '0x41');
    expect(result[0].json).toHaveProperty('protocolVersionDecimal', 65);
  });

  it('should handle RPC errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getChainId');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found'
        },
        id: 1
      })
    );

    const items = [{ json: {} }];
    
    await expect(
      executeNetworkOperations.call(mockExecuteFunctions, items)
    ).rejects.toThrow('RPC Error: Method not found');
  });

  it('should handle network errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getChainId');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeNetworkOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toHaveProperty('error', 'Network error');
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

    const items = [{ json: {} }];
    
    await expect(
      executeNetworkOperations.call(mockExecuteFunctions, items)
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});
});
