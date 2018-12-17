import { encodeFunctionCall, decodeParameters } from '@0xcert/ethereum-utils';
import { AssetLedger } from '../core/ledger';
import xcertAbi from '../config/xcert-abi';

/**
 * Smart contract method abi.
 */
const abis = ['name', 'symbol', 'uriBase', 'schemaId', 'totalSupply'].map((name) => {  
  return xcertAbi.find((a) => (
    a.name === name && a.type === 'function'
  ));
});

/**
 * Gets information(name, symbol, uriBase, schemaId, supply) of the asset ledger.
 * @param ledger Asset ledger instance.
 */
export default async function(ledger: AssetLedger) {
  const info = await Promise.all(
    abis.map(async (abi) => {
      try {
        const attrs = {
          to: ledger.id,
          data: encodeFunctionCall(abi, []),
        };
        const res = await ledger.provider.post({
          method: 'eth_call',
          params: [attrs, 'latest'],
        });
        return decodeParameters(abi.outputs, res.result)[0];
      } catch (error) {
        return null;
      }
    })
  );
  return {
    name: info[0],
    symbol: info[1],
    uriBase: info[2],
    schemaId: info[3],
    supply: info[4],
  };
}