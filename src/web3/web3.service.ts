import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DCEns } from 'one-country-sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import { ClaimsService } from '../claim/claims.service';
import { ClaimsModule } from '../claim/claims.module';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

@Injectable()
export class Web3Service {
  private dc: DCEns;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly claimsService: ClaimsService,
  ) {
    const provider = new Web3.providers.HttpProvider(
      configService.get('web3.rpcUrl'),
    );
    this.dc = new DCEns({
      provider,
      contractAddress: configService.get('web3.oneCountryContractAddress'),
      privateKey: configService.get('web3.oneWalletPrivateKey'),
    });
  }

  // CoinGecko Free plan API https://www.coingecko.com/en/api/documentation
  async getTokenPrice(id = 'harmony', currency = 'usd'): Promise<number> {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`,
      ),
    );
    if (data && data[id] && data[id][currency]) {
      return data[id][currency];
    }
    throw new Error(
      `Cannot find pair id: ${id}, currency: ${currency}. Check CoinGecko API.`,
    );
  }

  async getDomainPriceInOne(name: string) {
    const price = await this.dc.getPrice(name);
    return price.amount;
  }

  getOneCountryAccountAddress() {
    return this.dc.accountAddress;
  }

  async getCheckoutUsdAmount(amountOne: string): Promise<string> {
    const minAmount = this.configService.get('stripe.checkoutMinAmount');
    const oneRate = await this.getTokenPrice('harmony');
    const value = (oneRate * +amountOne) / Math.pow(10, 18);
    const usdCents = Math.ceil(value * 100);
    if (minAmount) {
      return Math.max(usdCents, minAmount).toString();
    }
    return usdCents.toString();
  }

  private async sleep(timeout: number) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }

  async register(domainName: string, ownerAddress: string) {
    const secret = Math.random().toString(26).slice(2);

    let commitmentRes;

    commitmentRes = await this.dc.makeCommitment(
      domainName,
      ownerAddress,
      secret,
    );

    await this.dc.commit(commitmentRes);

    await this.sleep(5000);

    return await this.dc.register(domainName, ownerAddress, secret);
  }

  async registerFull(domainName: string, ownerAddress: string) {
    const secret = Math.random().toString(26).slice(2);

    let commitmentRes, registerRes, purchaseRes, certGenRes;

    try {
      commitmentRes = await this.dc.makeCommitment(
        domainName,
        ownerAddress,
        secret,
      );
      await this.dc.commit(commitmentRes);
    } catch (e) {
      console.error(e);
    }

    await this.sleep(5000);

    try {
      registerRes = await this.dc.register(domainName, ownerAddress, secret);
    } catch (e) {
      console.error(e);
    }

    await this.sleep(4000);

    try {
      purchaseRes = await axios.post<any>(`https://1ns-registrar-relayer.hiddenstate.xyz/purchase`, {
        domain: `${domainName}.country`,
        // txHash: txRegister.hash,
        address: ownerAddress,
        txHash: '0xff154ffd3fe5f0ae420a05d2a6087e361e5aa88d381b483cc536c68dd3deda61',
        fast: 1
      })
    } catch (e) {
      console.error(e)
    }

    try {
      certGenRes = await axios.post<any>(`https://1ns-registrar-relayer.hiddenstate.xyz/gen`, {
        domain: `${domainName}.country`,
      })
    } catch (e) {
      console.error(e)
    }

    // return axios.post<any>(`https://mdo-dcobackend-01.t.hmny.io/domains/`, {
    //   domainName,
    //   // txHash: txRegister.hash,
    //   txHash: '0xa6987a76a9b585e07b81e598ef2404d465ea9dc1dc74eb7c3a5edcd190687b9d'
    // })

    return { commitmentRes, registerRes, purchaseRes, certGenRes };
  }

  async getAddressBalance(address: string) {
    const web3 = new Web3(this.configService.get('web3.rpcUrl'));
    return await web3.eth.getBalance(address);
    // return web3.utils.toWei(balance);
  }

  async getOneCountryServiceBalance() {
    return await this.getAddressBalance(this.dc.accountAddress);
  }

  validateAuthKey(key: string) {
    return key === this.configService.get('authKey');
  }

  async isAddressHasClaim(address: string) {
    const claim = await this.claimsService.findByAddress(address);
    return !!claim;
  }

  async createClaim(address: string, domain: string) {
    return this.claimsService.create(address, domain);
  }
}
