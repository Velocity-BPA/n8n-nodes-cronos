/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * See LICENSE file for details.
 */

/**
 * Integration tests for n8n-nodes-cronos
 * These tests verify the node structure and exports
 */

describe('Node Structure Tests', () => {
	describe('Cronos Node', () => {
		it('should export Cronos class', async () => {
			const { Cronos } = await import('../nodes/Cronos/Cronos.node');
			expect(Cronos).toBeDefined();
		});

		it('should have correct node description', async () => {
			const { Cronos } = await import('../nodes/Cronos/Cronos.node');
			const node = new Cronos();
			
			expect(node.description.displayName).toBe('Cronos');
			expect(node.description.name).toBe('cronos');
			expect(node.description.version).toBe(1);
			expect(node.description.credentials).toBeDefined();
		});

		it('should have all required resources', async () => {
			const { Cronos } = await import('../nodes/Cronos/Cronos.node');
			const node = new Cronos();
			
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource'
			);
			expect(resourceProperty).toBeDefined();
			
			const resourceOptions = (resourceProperty as { options: { value: string }[] }).options;
			const resourceValues = resourceOptions.map((o) => o.value);
			
			expect(resourceValues).toContain('accounts');
			expect(resourceValues).toContain('transactions');
			expect(resourceValues).toContain('blocks');
			expect(resourceValues).toContain('smartContracts');
			expect(resourceValues).toContain('tokens');
			expect(resourceValues).toContain('nfts');
			expect(resourceValues).toContain('defi');
			expect(resourceValues).toContain('network');
			expect(resourceValues).toContain('events');
			expect(resourceValues).toContain('utility');
		});
	});

	describe('Cronos Trigger Node', () => {
		it('should export CronosTrigger class', async () => {
			const { CronosTrigger } = await import('../nodes/Cronos/CronosTrigger.node');
			expect(CronosTrigger).toBeDefined();
		});

		it('should have correct trigger description', async () => {
			const { CronosTrigger } = await import('../nodes/Cronos/CronosTrigger.node');
			const node = new CronosTrigger();
			
			expect(node.description.displayName).toBe('Cronos Trigger');
			expect(node.description.name).toBe('cronosTrigger');
			expect(node.description.polling).toBe(true);
		});

		it('should have all trigger event types', async () => {
			const { CronosTrigger } = await import('../nodes/Cronos/CronosTrigger.node');
			const node = new CronosTrigger();
			
			const eventProperty = node.description.properties.find(
				(p) => p.name === 'event'
			);
			expect(eventProperty).toBeDefined();
			
			const eventOptions = (eventProperty as { options: { value: string }[] }).options;
			const eventValues = eventOptions.map((o) => o.value);
			
			expect(eventValues).toContain('newBlock');
			expect(eventValues).toContain('newTransactionToAddress');
			expect(eventValues).toContain('tokenTransfer');
			expect(eventValues).toContain('contractEvent');
			expect(eventValues).toContain('largeTransaction');
		});
	});

	describe('Credentials', () => {
		it('should export CronosApi credentials', async () => {
			const { CronosApi } = await import('../credentials/CronosApi.credentials');
			expect(CronosApi).toBeDefined();
		});

		it('should have correct credential properties', async () => {
			const { CronosApi } = await import('../credentials/CronosApi.credentials');
			const creds = new CronosApi();
			
			expect(creds.name).toBe('cronosApi');
			expect(creds.displayName).toBe('Cronos API');
			
			const properties = creds.properties;
			const propertyNames = properties.map((p) => p.name);
			
			expect(propertyNames).toContain('network');
			expect(propertyNames).toContain('rpcEndpoint');
			expect(propertyNames).toContain('privateKey');
			expect(propertyNames).toContain('cronosScanApiKey');
		});
	});
});

describe('Action Operations', () => {
	it('should export accounts operations', async () => {
		const { accountsOperations } = await import('../nodes/Cronos/actions/accounts');
		
		expect(accountsOperations.getBalance).toBeDefined();
		expect(accountsOperations.getTokenBalances).toBeDefined();
		expect(accountsOperations.getNFTs).toBeDefined();
		expect(accountsOperations.getTransactionHistory).toBeDefined();
		expect(accountsOperations.getTokenTransfers).toBeDefined();
	});

	it('should export transactions operations', async () => {
		const { transactionsOperations } = await import('../nodes/Cronos/actions/transactions');
		
		expect(transactionsOperations.getTransaction).toBeDefined();
		expect(transactionsOperations.getTransactionReceipt).toBeDefined();
		expect(transactionsOperations.sendTransaction).toBeDefined();
		expect(transactionsOperations.estimateGas).toBeDefined();
		expect(transactionsOperations.getTransactionStatus).toBeDefined();
	});

	it('should export blocks operations', async () => {
		const { blocksOperations } = await import('../nodes/Cronos/actions/blocks');
		
		expect(blocksOperations.getBlock).toBeDefined();
		expect(blocksOperations.getLatestBlock).toBeDefined();
		expect(blocksOperations.getBlockTransactions).toBeDefined();
		expect(blocksOperations.getBlockByTimestamp).toBeDefined();
	});

	it('should export smart contracts operations', async () => {
		const { smartContractsOperations } = await import('../nodes/Cronos/actions/smartContracts');
		
		expect(smartContractsOperations.getContractABI).toBeDefined();
		expect(smartContractsOperations.readContract).toBeDefined();
		expect(smartContractsOperations.writeContract).toBeDefined();
		expect(smartContractsOperations.getContractSource).toBeDefined();
		expect(smartContractsOperations.getContractEvents).toBeDefined();
		expect(smartContractsOperations.deployContract).toBeDefined();
	});

	it('should export tokens operations', async () => {
		const { tokensOperations } = await import('../nodes/Cronos/actions/tokens');
		
		expect(tokensOperations.getTokenInfo).toBeDefined();
		expect(tokensOperations.getTokenHolders).toBeDefined();
		expect(tokensOperations.getTokenTransfers).toBeDefined();
		expect(tokensOperations.getTokenPrice).toBeDefined();
		expect(tokensOperations.getTopTokens).toBeDefined();
	});

	it('should export nfts operations', async () => {
		const { nftsOperations } = await import('../nodes/Cronos/actions/nfts');
		
		expect(nftsOperations.getNFTMetadata).toBeDefined();
		expect(nftsOperations.getNFTTransfers).toBeDefined();
		expect(nftsOperations.getCollectionInfo).toBeDefined();
		expect(nftsOperations.getNFTOwners).toBeDefined();
	});

	it('should export defi operations', async () => {
		const { defiOperations } = await import('../nodes/Cronos/actions/defi');
		
		expect(defiOperations.getProtocolTVL).toBeDefined();
		expect(defiOperations.getPoolInfo).toBeDefined();
		expect(defiOperations.getDEXStats).toBeDefined();
		expect(defiOperations.getYieldFarms).toBeDefined();
	});

	it('should export network operations', async () => {
		const { networkOperations } = await import('../nodes/Cronos/actions/network');
		
		expect(networkOperations.getNetworkStatus).toBeDefined();
		expect(networkOperations.getGasPrice).toBeDefined();
		expect(networkOperations.getValidators).toBeDefined();
		expect(networkOperations.getChainStats).toBeDefined();
	});

	it('should export events operations', async () => {
		const { eventsOperations } = await import('../nodes/Cronos/actions/events');
		
		expect(eventsOperations.getLogs).toBeDefined();
		expect(eventsOperations.subscribeToLogs).toBeDefined();
		expect(eventsOperations.filterEvents).toBeDefined();
	});

	it('should export utility operations', async () => {
		const { utilityOperations } = await import('../nodes/Cronos/actions/utility');
		
		expect(utilityOperations.convertUnits).toBeDefined();
		expect(utilityOperations.encodeFunction).toBeDefined();
		expect(utilityOperations.decodeData).toBeDefined();
		expect(utilityOperations.getAPIHealth).toBeDefined();
	});
});

describe('Transport Layer', () => {
	it('should export transport functions', async () => {
		const transport = await import('../nodes/Cronos/transport');
		
		expect(transport.jsonRpcRequest).toBeDefined();
		expect(transport.cronosScanRequest).toBeDefined();
		expect(transport.batchJsonRpcRequest).toBeDefined();
		expect(transport.getNetworkConfig).toBeDefined();
		expect(transport.getRpcUrl).toBeDefined();
		expect(transport.getScanApiUrl).toBeDefined();
		expect(transport.getChainId).toBeDefined();
	});

	it('should have correct network configurations', async () => {
		const { getNetworkConfig } = await import('../nodes/Cronos/transport');
		
		const mainnet = getNetworkConfig('mainnet');
		expect(mainnet.rpcUrl).toBe('https://evm.cronos.org');
		expect(mainnet.chainId).toBe(25);
		
		const testnet = getNetworkConfig('testnet');
		expect(testnet.rpcUrl).toBe('https://evm-t3.cronos.org');
		expect(testnet.chainId).toBe(338);
	});
});
