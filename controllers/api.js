var config = require('../config');

const sleep = require('sleep');

const Chain3 = require('chain3');

const chain3 = new Chain3();

chain3.setProvider(new chain3.providers.HttpProvider(config.chain3_provider || 'http://127.0.0.1:8545'));

const ABI_ERC20_BASIC = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];
const ABI_ERC20_STANDARD = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];

const CONTRACT_ERC20_BASIC = chain3.mc.contract(ABI_ERC20_BASIC);
const CONTRACT_ERC20_STANDARD = chain3.mc.contract(ABI_ERC20_STANDARD);

const APIError = require('../rest').APIError;

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
	'GET /api/token/:address': async (ctx, next) => {
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
