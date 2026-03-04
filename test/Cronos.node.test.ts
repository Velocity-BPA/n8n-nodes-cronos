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
        apiKey: 'test-api-key',
        baseUrl: 'https://cronos.org/explorer/api',
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

  describe('getBalance', () => {
    it('should get balance for a single address successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBalance';
          case 'address': return '0x123456789abcdef';
          case 'tag': return 'latest';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('module=account&action=balance'),
          json: true,
        })
      );
    });

    it('should handle getBalance error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getBalance';
          case 'address': return '0x123456789abcdef';
          case 'tag': return 'latest';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getMultipleBalances', () => {
    it('should get multiple balances successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          { account: '0x123', balance: '1000000000000000000' },
          { account: '0x456', balance: '2000000000000000000' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getMultipleBalances';
          case 'addresses': return '0x123,0x456';
          case 'tag': return 'latest';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getTransactions', () => {
    it('should get transactions successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            hash: '0xabc123',
            from: '0x123',
            to: '0x456',
            value: '1000000000000000000',
            blockNumber: '100',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTransactions';
          case 'address': return '0x123456789abcdef';
          case 'startblock': return 0;
          case 'endblock': return 99999999;
          case 'page': return 1;
          case 'offset': return 10;
          case 'sort': return 'asc';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getTokenTransactions', () => {
    it('should get token transactions successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            hash: '0xdef456',
            from: '0x123',
            to: '0x456',
            value: '1000000000000000000',
            tokenName: 'Test Token',
            tokenSymbol: 'TEST',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTokenTransactions';
          case 'address': return '0x123456789abcdef';
          case 'contractaddress': return '0xcontract123';
          case 'page': return 1;
          case 'offset': return 10;
          case 'startblock': return 0;
          case 'endblock': return 99999999;
          case 'sort': return 'asc';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://cronos.org/explorer/api',
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

  describe('getTransaction', () => {
    it('should get transaction information successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: {
          hash: '0x123',
          from: '0xabc',
          to: '0xdef',
          value: '1000000000000000000',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransaction';
        if (param === 'txhash') return '0x123';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'proxy',
          action: 'eth_getTransactionByHash',
          txhash: '0x123',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });

    it('should handle API errors', async () => {
      const mockErrorResponse = {
        status: '0',
        message: 'Transaction not found',
        result: null,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransaction';
        if (param === 'txhash') return '0xinvalid';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

      await expect(executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
    });
  });

  describe('getTransactionReceipt', () => {
    it('should get transaction receipt successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: {
          transactionHash: '0x123',
          status: '0x1',
          gasUsed: '21000',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransactionReceipt';
        if (param === 'txhash') return '0x123';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'proxy',
          action: 'eth_getTransactionReceipt',
          txhash: '0x123',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getTransactionCount', () => {
    it('should get transaction count successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '0x5',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTransactionCount';
        if (param === 'address') return '0xabc123';
        if (param === 'tag') return 'latest';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'proxy',
          action: 'eth_getTransactionCount',
          address: '0xabc123',
          tag: 'latest',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });

  describe('sendRawTransaction', () => {
    it('should send raw transaction successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '0x123456789',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'sendRawTransaction';
        if (param === 'hex') return '0xf86c808504a817c800825208940x123...';
        return '';
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransactionOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'proxy',
          action: 'eth_sendRawTransaction',
          hex: '0xf86c808504a817c800825208940x123...',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });
});

describe('SmartContract Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://cronos.org/explorer/api',
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

  describe('getContractAbi', () => {
    it('should get contract ABI successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '[{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getContractAbi';
        if (param === 'address') return '0x1234567890123456789012345678901234567890';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'contract',
          action: 'getabi',
          address: '0x1234567890123456789012345678901234567890',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });

    it('should handle API error', async () => {
      const mockResponse = {
        status: '0',
        message: 'NOTOK',
        result: 'Contract source code not verified',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getContractAbi';
        if (param === 'address') return '0x1234567890123456789012345678901234567890';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      await expect(
        executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });
  });

  describe('getSourceCode', () => {
    it('should get source code successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [{
          SourceCode: 'contract Test { function test() public {} }',
          ABI: '[{"inputs":[],"name":"test","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
          ContractName: 'Test',
          CompilerVersion: 'v0.8.19+commit.7dd6d404',
        }],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSourceCode';
        if (param === 'address') return '0x1234567890123456789012345678901234567890';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('verifySourceCode', () => {
    it('should verify source code successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: 'guid123456789',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'verifySourceCode';
        if (param === 'contractaddress') return '0x1234567890123456789012345678901234567890';
        if (param === 'sourceCode') return 'contract Test { function test() public {} }';
        if (param === 'contractname') return 'Test';
        if (param === 'compilerversion') return 'v0.8.19+commit.7dd6d404';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://cronos.org/explorer/api/api',
        form: {
          module: 'contract',
          action: 'verifysourcecode',
          contractaddress: '0x1234567890123456789012345678901234567890',
          sourceCode: 'contract Test { function test() public {} }',
          contractname: 'Test',
          compilerversion: 'v0.8.19+commit.7dd6d404',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });

  describe('checkVerificationStatus', () => {
    it('should check verification status successfully', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: 'Pass - Verified',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'checkVerificationStatus';
        if (param === 'guid') return 'guid123456789';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('callContract', () => {
    it('should call contract successfully', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x0000000000000000000000000000000000000000000000000000000000000001',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'callContract';
        if (param === 'to') return '0x1234567890123456789012345678901234567890';
        if (param === 'data') return '0x06fdde03';
        if (param === 'tag') return 'latest';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'proxy',
          action: 'eth_call',
          to: '0x1234567890123456789012345678901234567890',
          data: '0x06fdde03',
          tag: 'latest',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });

    it('should handle contract call error', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32000,
          message: 'execution reverted',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'callContract';
        if (param === 'to') return '0x1234567890123456789012345678901234567890';
        if (param === 'data') return '0x06fdde03';
        if (param === 'tag') return 'latest';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      await expect(
        executeSmartContractOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });
  });
});

describe('Token Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://cronos.org/explorer/api',
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

  test('getTokenBalance should return token balance successfully', async () => {
    const mockResponse = {
      status: '1',
      message: 'OK',
      result: '1000000000000000000',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenBalance';
        case 'contractAddress': return '0x123...';
        case 'address': return '0xabc...';
        case 'tag': return 'latest';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTokenOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('module=account&action=tokenbalance'),
      json: true,
    });
  });

  test('getTokenTransfers should return token transfers successfully', async () => {
    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        {
          blockNumber: '12345',
          hash: '0x456...',
          from: '0xabc...',
          to: '0xdef...',
          value: '1000',
        },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenTransfers';
        case 'contractAddress': return '0x123...';
        case 'address': return '0xabc...';
        case 'page': return 1;
        case 'offset': return 10;
        case 'startBlock': return 0;
        case 'endBlock': return 'latest';
        case 'sort': return 'asc';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTokenOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('module=account&action=tokentx'),
      json: true,
    });
  });

  test('getNftTransfers should return NFT transfers successfully', async () => {
    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        {
          blockNumber: '12345',
          hash: '0x789...',
          from: '0xabc...',
          to: '0xdef...',
          tokenID: '1',
        },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getNftTransfers';
        case 'contractAddress': return '0x123...';
        case 'address': return '0xabc...';
        case 'page': return 1;
        case 'offset': return 10;
        case 'startBlock': return 0;
        case 'endBlock': return 'latest';
        case 'sort': return 'asc';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTokenOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('module=account&action=tokennfttx'),
      json: true,
    });
  });

  test('getTokenInfo should return token information successfully', async () => {
    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        {
          contractAddress: '0x123...',
          tokenName: 'Test Token',
          symbol: 'TEST',
          divisor: '18',
          tokenType: 'ERC-20',
          totalSupply: '1000000000000000000000',
        },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenInfo';
        case 'contractAddress': return '0x123...';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTokenOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('module=token&action=tokeninfo'),
      json: true,
    });
  });

  test('getTokenHolders should return token holders successfully', async () => {
    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        {
          TokenHolderAddress: '0xabc...',
          TokenHolderQuantity: '1000000000000000000',
        },
        {
          TokenHolderAddress: '0xdef...',
          TokenHolderQuantity: '500000000000000000',
        },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenHolders';
        case 'contractAddress': return '0x123...';
        case 'page': return 1;
        case 'offset': return 10;
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTokenOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('module=token&action=tokenholderlist'),
      json: true,
    });
  });

  test('should handle API errors properly', async () => {
    const mockErrorResponse = {
      status: '0',
      message: 'Invalid address',
      result: null,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenBalance';
        case 'contractAddress': return '0x123...';
        case 'address': return 'invalid';
        case 'tag': return 'latest';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockErrorResponse);

    await expect(
      executeTokenOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow();
  });

  test('should handle network errors with continueOnFail', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTokenBalance';
        case 'contractAddress': return '0x123...';
        case 'address': return '0xabc...';
        case 'tag': return 'latest';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeTokenOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('Network error');
  });
});

describe('Block Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://cronos.org/explorer/api',
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

  it('should get latest block successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getLatestBlock';
      return '';
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: '0x1a2b3c',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://cronos.org/explorer/api',
      qs: {
        module: 'proxy',
        action: 'eth_blockNumber',
        apikey: 'test-api-key',
      },
      json: true,
    });
  });

  it('should get block by number successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getBlockByNumber';
      if (paramName === 'tag') return 'latest';
      if (paramName === 'boolean') return true;
      return '';
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: {
        number: '0x1a2b3c',
        hash: '0xabcdef...',
        transactions: [],
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get block reward successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getBlockReward';
      if (paramName === 'blockno') return '12345';
      return '';
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: {
        blockNumber: '12345',
        blockMiner: '0x123...',
        blockReward: '2000000000000000000',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get block by timestamp successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getBlockByTimestamp';
      if (paramName === 'timestamp') return '1634567890';
      if (paramName === 'closest') return 'before';
      return '';
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: '12345',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get uncle block successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getUncleBlock';
      if (paramName === 'tag') return 'latest';
      if (paramName === 'index') return '0x0';
      return '';
    });

    const mockResponse = {
      status: '1',
      message: 'OK',
      result: {
        number: '0x1a2b3c',
        hash: '0xabcdef...',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'getLatestBlock';
      return '';
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string, itemIndex: number) => {
      if (paramName === 'operation') return 'unknownOperation';
      return '';
    });

    await expect(executeBlockOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
  });
});

describe('Stats Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://cronos.org/explorer/api',
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

  describe('getTotalSupply', () => {
    it('should get total supply successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTotalSupply';
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '30263193431077856967036542',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'stats',
          action: 'tokensupply',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });

    it('should handle errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getTotalSupply';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow();
    });
  });

  describe('getCronosSupply', () => {
    it('should get Cronos supply successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getCronosSupply';
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '25263193431077856967036542',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'stats',
          action: 'cronosupply',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getCronoPrice', () => {
    it('should get Crono price successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getCronoPrice';
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: {
          crobtc: '0.000001234',
          crousd: '0.0567',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'stats',
          action: 'cronoprice',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getNodeCount', () => {
    it('should get node count successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getNodeCount';
        return undefined;
      });

      const mockResponse = {
        status: '1',
        message: 'OK',
        result: '142',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'stats',
          action: 'nodecount',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getGasPrice', () => {
    it('should get gas price successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getGasPrice';
        return undefined;
      });

      const mockResponse = {
        jsonrpc: '2.0',
        id: 73,
        result: '0x4a817c800',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeStatsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([
        {
          json: mockResponse,
          pairedItem: { item: 0 },
        },
      ]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://cronos.org/explorer/api/api',
        qs: {
          module: 'proxy',
          action: 'eth_gasPrice',
          apikey: 'test-api-key',
        },
        json: true,
      });
    });
  });
});
});
