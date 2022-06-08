import React, { Component } from 'react'
import {ethers} from 'ethers';
import Token from '../token.json'
import EthSwap from '../ethSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    window.utils = ethers.utils;
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const data = await window.ethereum.request({method: "eth_requestAccounts"});
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const singer = provider.getSigner();

    const ethSwap = new ethers.Contract(
      EthSwap.address,
      EthSwap.abi,
      singer
    );

    const ethBalance = ethers.utils.formatEther(await provider.getBalance(data[0]));
    this.setState({ ethBalance })

    // Load Token
    const token = new ethers.Contract(
      Token.address,
      Token.abi,
      singer
    );
    this.setState({ token });

    this.setState({ account: data[0] })

    const tokenBalanceOf = await token.balanceOf(data[0]);
    const tokenBalance = ethers.utils.formatEther(tokenBalanceOf);

    this.setState({ tokenBalance });

  // Load EthSwap
    this.setState({ ethSwap })

    this.setState({ loading: false })
  }

  buyTokens = async (etherAmount) => {
    this.setState({ loading: true })
    const options = {
      value: etherAmount,
    };
    try {
      const transaction = await this.state.ethSwap.buyTokens(options);
      await transaction.wait();
      await this.loadBlockchainData();
    } catch (e) {
      this.setState({ error: e.data !== undefined ? e.data.message : e.message });
    } finally {
      this.setState({ loading: false })
    }
  }

  sellTokens = async (tokenAmount) => {
    this.setState({ loading: true })
    const options = {
      from: this.state.account,
    };
    try {
      console.log(this.state.ethSwap, "this.state.ethSwap");
      const amount = window.utils.parseEther(tokenAmount);
      const transactionApprove = await this.state.token.approve(this.state.ethSwap.address, amount, options);
      transactionApprove.wait();

      const transaction = await this.state.ethSwap.sellTokens(amount);
      await transaction.wait();
      await this.loadBlockchainData();
    } catch (e) {
      console.log(e);
      this.setState({ error: e.data !== undefined ? e.data.message : e.message });
    } finally {
      this.setState({ loading: false })
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      error: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
    let content;
    let {loading, error} = this.state;
    if(loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
          ethBalance={this.state.ethBalance}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens}
          sellTokens={this.sellTokens}
      />
    }

    return (
        <div>
          <Navbar account={this.state.account} />
          <div className="container-fluid mt-5">
            <div className="row">
              <p className="errorText">{error}</p>
              <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
                <div className="content mr-auto ml-auto">
                  {content}
                </div>
              </main>
            </div>
          </div>
        </div>
    );
  }
}

export default App;
