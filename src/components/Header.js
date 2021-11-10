import Web3 from 'web3'
import React, { Component, useEffect, useState } from 'react'
import { Navbar, Nav, NavDropdown, Dropdown, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { ThemeConsumer } from '../context/ThemeContext';
import tokens from "../store/tokens";
import Exchanges from "../store/exchanges";
import { accountSelector, etherBalanceSelector, userEmailSelector, userNameSelector, } from '../store/selectors';
import { db } from "./firebase/firebase";


const Notification = (props) => {
  const account = localStorage.getItem("account-address");
  const [fillFlag, setFillflag] = useState(false);
  const [showName, setshowName] = useState([]);
  const [orderAmount, setorderAmount] = useState([]);
  const [tokenFlag, setTokenflag] = useState(false);
  const [notificationCount, setNotificationcount] = useState(0);

  db.collection('notification').doc(account).get((snap) => {
    if (snap.data()) {
      let { type, amount, id } = snap.data();
      if (type === 'changed') {
        db.collection('notification').doc(account).set({
          type: 'unchanged',
          amount: 0,
          id: ''
        })
        let amt = orderAmount;
        amt.push(amount);
        setorderAmount(amt)
        let nameid = showName;
        nameid.push(id);
        setshowName(nameid)
        let cnt = notificationCount;
        cnt++;
        setNotificationcount(cnt)
        setFillflag(true)
      }
    }
  })
  function clearnotify() {
    setFillflag(false)
    setTokenflag(false)
    setshowName([])
    setorderAmount([])
    setShowEth([]);
    setNotificationcount(0)
  }
  const [ethBal, setEthBal] = useState(0);
  const [showEth, setShowEth] = useState([]);
  const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

  useEffect(() => {
    let interval = null;
    if (1) {
      interval = setInterval(async () => {
        console.log("this is data==>",orderAmount)
        if (account) {
          await db.collection('notification').doc(account).get()
            .then(snap => {
              if (snap.data()) {
                let { type, amount, id } = snap.data();
                if (type === 'changed') {
                  db.collection('notification').doc(account).set({
                    type: 'unchanged',
                    amount: 0,
                    id: ''
                  })
                  let amt = orderAmount;
                  amt.push(amount);
                  setorderAmount(amt)
                  let nameid = showName;
                  nameid.push(id);
                  setshowName(nameid)
                  let cnt = notificationCount;
                  cnt++;
                  setNotificationcount(cnt)
                  setFillflag(true)
                }
              }
            })
          await web3.eth.getBalance(account, function (err, result) {
            if (err) {
              console.log(err)
            } else {
              var etherval = web3.utils.fromWei(result, "ether");
              if (ethBal === 0) {
                setEthBal(etherval);
              }
              else if (ethBal !== etherval && ethBal < etherval) {
                showEth.push(etherval - ethBal);
                setShowEth(showEth)
                setEthBal(etherval);
                let cnt = notificationCount;
                cnt++;
                setNotificationcount(cnt)
                setTokenflag(true);
              }
            }
          })
        }
      }, 2000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [ethBal, fillFlag, tokenFlag, showEth, notificationCount]);
  return (
    <>
      <Dropdown className="header-custom-icon">
        <ThemeConsumer>
          {({ data, update }) => (
            <Button variant="default" onClick={update} id="darkTheme">
              {data.theme === 'light' ? (
                <i className="icon ion-md-moon"></i>
              ) : (
                <i className="icon ion-md-sunny"></i>
              )}
            </Button>
          )}
        </ThemeConsumer>
        <Dropdown.Toggle variant="default">
          <i className="icon ion-md-notifications"></i>
          {notificationCount > 0 && <span className="circle-pulse"></span>}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <div className="dropdown-header d-flex align-items-center justify-content-between">
            {notificationCount > 0 && <><p className="mb-0 font-weight-medium">
              {notificationCount} New Notifications
            </p>
              <a href="#!" onClick={() => clearnotify()} className="text-muted">
                Clear all
              </a></>}
          </div>
          <div className="dropdown-body">
            {
              fillFlag && <>{
                orderAmount.map((obj, key) => (
                  <a href="#!" className="dropdown-item">
                    <div className="icon">
                      <i className="icon ion-logo-bitcoin"></i>
                    </div>
                    <div className="content">
                      <p>Order filled for {eval((obj).toFixed(2))} of {showName[key]}</p>
                      {/* <p className="sub-text text-muted">2 s ago</p> */}
                    </div>
                  </a>
                ))
              }</>

            }
            {tokenFlag && <>{
              showEth.map((obj, key) => (
                <a href="#!" className="dropdown-item">
                  <div className="icon">
                    <i className="icon ion-logo-usd"></i>
                  </div>
                  <div className="content">
                    <p>You have received {eval((obj).toFixed(2))} Ethereum</p>
                    {/* <p className="sub-text text-muted">4 hrs ago</p> */}
                  </div>
                </a>
              ))
            }
            </>}
          </div>
          {notificationCount == 0 && <div className="dropdown-footer d-flex align-items-center justify-content-center">
            <a href="#!">no new notifications</a>
          </div>}
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenbal: [],
      exchangeses: [],
      token_cost: [],
      token_percent: [],
      token_price: [],
      tokenName: [],
      loading: false,
      exchangeName: [],
      isOpen: false
    }

    this.readAccountDappValue = this.readAccountDappValue.bind(this);
  }
  readAccountDappValue = async (account1) => {
    let { loading, tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price, token_percent } = this.state;
    tokenbal = [];
    exchangeses = [];
    token_cost = [];
    token_price = [];
    tokenName = [];
    exchangeName = [];
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    const networkId = await web3.eth.net.getId();
    for (var i = 0; i < Object.entries(tokens).length; i++) {
      tokenName.push(Object.entries(tokens)[i][0])
      exchangeName.push(Object.entries(Exchanges)[i][0])
    }
    for (var i = 0; i < tokenName.length; i++) {
      var token = tokens[tokenName[i]].default;
      var exchang = Exchanges[exchangeName[i]].default;
      var tokenInst = new web3.eth.Contract(token.abi, token.networks[networkId].address)
      let bal = await tokenInst.methods.balanceOf(account1).call();
      tokenbal.push(bal / (10 ** 18));
      exchangeses.push(new web3.eth.Contract(exchang.abi, exchang.networks[networkId].address))
    }
    for (var j = 0; j < exchangeName.length; j++) {
      var token = tokens[tokenName[j]].default;
      var tradeStream = await exchangeses[j].getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
      var filledOrders = await tradeStream.map((event) => event.returnValues)
      var tmp_cost = 0;
      var tmp_price = 0;
      var tmp_percent = 0;
      if (filledOrders.length > 0) {
        var cnt = 0;
        for (var i = 0; i < filledOrders.length; i++) {
          let unix_timestamp = filledOrders[i].timestamp
          var date = new Date(unix_timestamp * 1000);
          var pricedate = date.getDate();
          var currentdate = new Date();
          var datetime = currentdate.getDate();
          if (datetime - pricedate == 1) {
            if (filledOrders[i].tokenGive == token.networks[networkId].address) {
              cnt++
              tmp_percent = (tmp_percent * (cnt - 1) + filledOrders[i].amountGet / filledOrders[i].amountGive) / cnt;
            }
            else {
              cnt++
              tmp_percent = (tmp_percent * (cnt - 1) + filledOrders[i].amountGive / filledOrders[i].amountGet) / cnt;
            }
          }
          if (filledOrders[i].userFill != filledOrders[i].user && filledOrders[i].userFill == account1 && filledOrders[i].tokenGive == token.networks[networkId].address) {
            tmp_cost += filledOrders[i].amountGet / (10 ** 18);
          }
          if (filledOrders[i].userFill != filledOrders[i].user && filledOrders[i].user == account1 && filledOrders[i].tokenGet == token.networks[networkId].address) {
            tmp_cost += filledOrders[i].amountGive / (10 ** 18);
          }
        }
        if (filledOrders[filledOrders.length - 1].tokenGive == token.networks[networkId].address) {
          tmp_price = filledOrders[filledOrders.length - 1].amountGet / filledOrders[filledOrders.length - 1].amountGive;
        }
        else {
          tmp_price = filledOrders[filledOrders.length - 1].amountGive / filledOrders[filledOrders.length - 1].amountGet;
        }
      }
      token_price.push(tmp_price);
      token_cost.push(tmp_cost);
      token_percent.push(tmp_percent);
    }
    loading = true;
    this.setState({ loading, tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price, token_percent });
  }
  componentDidMount() {
    let el = document.querySelector('#darkTheme');
    if (el) {
      el.addEventListener('click', function () {
        document.body.classList.toggle('dark');
      });
    }
    if (this.props.account) {
      this.readAccountDappValue(this.props.account);
    }
    else {
      this.readAccountDappValue(localStorage.getItem("account-address"));
    }
  }
  render() {
    let { loading, tokenName, exchangeName, tokenbal, exchangeses, token_cost, token_price, token_percent } = this.state;
    return (
      <>
        <header className="light-bb">
          <Navbar expand="lg">
            <Link className="navbar-brand" to="/">
              <ThemeConsumer>
                {({ data }) => {
                  return data.theme === 'light' ? (
                    <img src={'/img/stocksfc.png'} alt="logo" />
                  ) : (
                    <img src={'/img/stocksfc.png'} alt="logo" />
                  );
                }}
              </ThemeConsumer>
            </Link>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="navbar-nav mr-auto">
                <a className="nav-link" href="/players/mbappe">Exchange</a>
                <NavDropdown title="Players">
                  <a className="dropdown-item" href="/players/haaland">Haaland</a>
                  <a className="dropdown-item" href="/players/mbappe">mbappe</a>
                  <a className="dropdown-item" href="/orders">all orders</a>
                  <a className="dropdown-item" href="/recents">all transactions</a>
                  <Link to="/players" className="dropdown-item">
                    All Players
                  </Link>
                  <Link to="/ipos" className="dropdown-item">
                    IPO's
                  </Link>
                </NavDropdown>
                <Link to="/portfolio" className="nav-link">
                  Portfolio
                </Link>
                <NavDropdown title="Rewards">
                  <Link to="/rankings" className="dropdown-item">
                    Rankings
                  </Link>
                  <Link to="/payouts" className="dropdown-item">
                    Payouts
                  </Link>
                </NavDropdown>
                <NavDropdown title="Others">
                  <Link to="/login" className="dropdown-item">
                    Login
                  </Link>
                  <Link to="/signup" className="dropdown-item">
                    Sign up
                  </Link>
                  <Link to="/lock" className="dropdown-item">
                    Lock
                  </Link>
                  <Link to="/otp-number" className="dropdown-item">
                    OTP Number
                  </Link>
                  <Link to="/otp-verify" className="dropdown-item">
                    OTP Verify
                  </Link>
                  <Link to="/reset" className="dropdown-item">
                    Reset Password
                  </Link>
                  <Link to="/change" className="dropdown-item">
                    Change Password
                  </Link>
                  <Link to="/notfound" className="dropdown-item">
                    404
                  </Link>
                  <a className="dropdown-item" href="/ipo/mbappe">Ipo</a>
                  <Link to="/playerstats" className="dropdown-item">
                    Player Stats
                  </Link>
                  <Link to="/walletbalance" className="dropdown-item">
                    Wallet Balance
                  </Link>
                </NavDropdown>
              </Nav>
              <Nav className="navbar-nav ml-auto">
                <Notification {...this.props}></Notification>
                <Dropdown className="header-img-icon">
                  <Dropdown.Toggle variant="default">
                    <img src={'/img/avatar.svg'} alt="avatar" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <div className="dropdown-header d-flex flex-column align-items-center">
                      <div className="figure mb-3">
                        <img src={'/img/avatar.svg'} alt="" />
                      </div>
                      <div className="info text-center">
                        <p id="avata-name" className="name font-weight-bold mb-0">{this.props.userName}</p>
                        <p id="avata-email" className="email text-muted mb-3">
                          {this.props.userEmail}
                        </p>
                      </div>
                    </div>
                    <div className="dropdown-body">
                      <ul className="profile-nav">
                        <li className="nav-item">
                          <Link to="/profile" className="nav-link">
                            <i className="icon ion-md-person"></i>
                            <span>Profile</span>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/wallet" className="nav-link">
                            <i className="icon ion-md-wallet"></i>
                            <span>My Wallet</span>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/settings" className="nav-link">
                            <i className="icon ion-md-settings"></i>
                            <span>Settings</span>
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link to="/login" className="nav-link red">
                            <i className="icon ion-md-power"></i>
                            {this.props.userName ? <span>Log Out</span> : <span>Log In</span>}
                            {/* <span>Log Out</span> */}
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <div className="ticker-wrap">
            <div className="ticker">
              {
                tokenName.map((obj, key) => (
                  token_percent[key] ?
                    <>
                      {
                        (100 * token_price[key] / token_percent[key]) > 0 ?
                          <div className="ticker__item"><up> {obj + " : (" + eval((token_price[key]).toFixed(4)) + ")" + eval((100 * token_price[key] / token_percent[key]).toFixed(0)) + "%  "}  &#8593;</up></div>
                          :
                          <div className="ticker__item"><down>{obj + " : (" + eval((token_price[key]).toFixed(4)) + ")" + eval((100 * token_price[key] / token_percent[key]).toFixed(0)) + "% "} &#8595;</down> </div>
                      }
                    </>
                    :
                    <div className="ticker__item"><up> {obj + " : (" + eval((token_price[key]).toFixed(4)) + ")" + 0 + "%  "}  &#8593;</up></div>
                )
                )
              }
            </div>
          </div>
        </header>
      </>
    );
  }
}

function mapStateToProps(state) {
  const userName = userNameSelector(state)
  const userEmail = userEmailSelector(state)

  return {
    userName: userName,
    account: accountSelector(state),
    userEmail: userEmail,
    etherBalance: etherBalanceSelector(state),
  }
}


export default connect(mapStateToProps)(Header);