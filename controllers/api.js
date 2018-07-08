var config = require('../config');

const abi = require('../abi')

const axios = require('axios');

const sleep = require('sleep');

const Chain3 = require('chain3');

const chain3 = new Chain3();

chain3.setProvider(new chain3.providers.HttpProvider(config.chain3_provider || 'http://127.0.0.1:8545'));

const CONTRACT_ERC20_MINIMAL = chain3.mc.contract(abi.ABI_ERC20_MINIMAL);
const CONTRACT_ERC20_BASIC = chain3.mc.contract(abi.ABI_ERC20_BASIC);
const CONTRACT_ERC20_STANDARD = chain3.mc.contract(abi.ABI_ERC20_STANDARD);

const APIError = require('../rest').APIError;

async function get_logs(events) {
	return new Promise((resolve, reject) => {
		events.get(function(error,result) {
			if (!error) { resolve(result); console.log("good"); }
			else { console.log("ooooh"); reject(error); }
		});
	});
}

jsonrpc_options = {
	jsonrpc: "2.0",
	id: 1,
	method: "eth_getLogs",
	params: [
		{
			fromBlock: "earliest",
			toBLock: "latest",
			// event: Transfer
			// topics: [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',null,null]
		}
	]
};
module.exports = {
	'GET /api/block': async (ctx, next) => {
		ctx.rest({info: 'index not ready yet, use the search please'});
	},
	'GET /api/block/:hash_or_height': async (ctx, next) => {
		var data = chain3.mc.getBlock(ctx.params.hash_or_height, true);
		if (!data) {
			throw new APIError('invalid_data', 'not found');
		}
		ctx.rest(data);
	},
	'GET /api/uncle': async (ctx, next) => {
		ctx.rest({info: 'index not ready yet, use the search please'});
	},
	'GET /api/uncle/:hash_or_height': async (ctx, next) => {
		var data = chain3.mc.getUncle(ctx.params.hash_or_height,0);
		if (!data) {
			throw new APIError('invalid_data', 'not found');
		}
		ctx.rest(data);
	},
	'GET /api/uncle/:hash_or_height/:index': async (ctx, next) => {
		var data = chain3.mc.getUncle(ctx.params.hash_or_height,ctx.params.index);
		if (!data) {
			throw new APIError('invalid_data', 'not found');
		}
		ctx.rest(data);
	},
	'GET /api/tx': async (ctx, next) => {
		ctx.rest({info: 'index not ready yet, use the search please'});
	},
	'GET /api/tx/:hash': async (ctx, next) => {
		var data = chain3.mc.getTransaction(ctx.params.hash);
		if (!data) {
			throw new APIError('invalid_data', 'not found');
		}
		ctx.rest(data);
	},
	'GET /api/address': async (ctx, next) => {
		ctx.rest({info: 'index not ready yet, use the search please'});
	},
	'GET /api/address/:address': async (ctx, next) => {
		var data = chain3.fromSha(chain3.mc.getBalance(ctx.params.address));
		if (!data) {
			throw new APIError('invalid_data', 'not found');
		} else {
			ctx.rest({balance_moac: data, count_transaction: chain3.mc.getTransactionCount(ctx.params.address)});
		}
	},
	'GET /api/address/:address/balance': async (ctx, next) => {
		var data = chain3.fromSha(chain3.mc.getBalance(ctx.params.address));
		if (!data) {
			throw new APIError('invalid_data', 'not found');
		} else {
			ctx.rest({balance_moac: data, count_transaction: chain3.mc.getTransactionCount(ctx.params.address)});
		}
	},
	'GET /api/address/:address/code': async (ctx, next) => {
		var data = chain3.mc.getCode(ctx.params.address);
		if (!data) {
			throw new APIError('invalid_data', 'not found');
		}
		ctx.rest({code: data});
	},
	'GET /api/token': async (ctx, next) => {
		ctx.rest({info: 'index not ready yet, use the search please'});
	},
	'GET /api/address/:address/token': async (ctx, next) => {
		var token_protocol = '';
		try {
			var contract = CONTRACT_ERC20_STANDARD.at(ctx.params.address);
			token_protocol = 'erc20';
		} catch (err) {
			console.log('non_erc20', 'not erc20 token');
		}
		if (!token_protocol) {
			throw new APIError('non_erc20', 'not erc20 token');
		} else {
			ctx.rest({protocol: token_protocol, name: contract.name(), symbol: contract.symbol(), decimals: contract.decimals(), totalSupply: contract.totalSupply()});
		}
	},
	'GET /api/address/:address/logs': async (ctx, next) => {
		var logs = [];
		var token_protocol = '';
		try {
			var contract = CONTRACT_ERC20_STANDARD.at(ctx.params.address);
			var events = contract.allEvents({fromBlock: 0, toBlock: chain3.mc.blockNumber - 1});
			token_protocol = 'erc20';
		} catch (err) {
			console.log('non_erc20', 'not erc20 token');
			throw new APIError('non_erc20', 'not erc20 token');
		}
		jsonrpc_options.params[0].address = ctx.params.address;
		jsonrpc_options.id = chain3.toDecimal(ctx.params.address)
		try {
			//logs = await get_logs(events);
			response = await axios.post(config.chain3_provider || 'http://127.0.0.1:8545', jsonrpc_options);
			logs = response.data.result
		} catch (error) {
			console.log(error);
			throw new APIError('logs_erc20', 'not retrieved');
		}
		ctx.rest(logs)
	},
	'GET /api/search': async (ctx, next) => {
		ctx.rest({info: 'index not ready yet, use the search please'});
	},
	'GET /api/search/:hash': async (ctx, next) => {
		var data;
		if ( chain3.isAddress(ctx.params.hash) ) {
			//handle wallet
			data = chain3.fromSha(chain3.mc.getBalance(ctx.params.hash));
			if (!data) {
				throw new APIError('invalid_data', 'not found');
			} else {
				ctx.rest({balance_moac: data});
			}
		} else {
			if ( ctx.params.hash.length < 40 ) {
				// handle block by block number
				data = chain3.mc.getBlock(ctx.params.hash, true);
			} else {
				// handle transaction try by hash
				data = chain3.mc.getTransaction(ctx.params.hash);
				if (!data) {
					//handle  block by hash
					data = chain3.mc.getBlock(ctx.params.hash, true);
				}
			}
			if (!data) {
				throw new APIError('invalid_data', 'not found');
			} else {
				ctx.rest(data);
			}
		}
	}
}
