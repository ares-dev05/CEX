import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move';
// import { Flipper, Flipped } from "react-flip-toolkit";

import configURL from '../config/config.json'
const rankdataurl = configURL.ratingURL;
class RankingsList extends Component{
  constructor(props){
    super(props);
    this.state={
      rankdata : null
    }
  }

  async getPlayerData(){
    let rankdata;
    rankdata = await fetch(rankdataurl)
    .then(response => response.text())
    .catch(error => {
      console.log(error);
    });
    return rankdata;
  }

  async componentDidMount(){
    let rankdata = await this.getPlayerData();
    this.setState({
      rankdata : rankdata
    })
    // alert(JSON.stringify(this.state.rankdata));
  }

  render(){
    if(this.state.rankdata){
      let playerdatalist = this.state.rankdata.split('\n');
      return(
      <>
        <div className="markets pb70">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="markets-pair-list">
                  <Tabs defaultActiveKey="favorites">
                    <Tab eventKey="favorites" title="★ Favorites">
                      <div className="table-responsive">
                        {/* <table className="table star-active"> */}
                          {/* <thead>
                            <tr>
                              <th>Pairs</th>
                              <th>Coin</th>
                              <th>Last Price</th>
                              <th>Change (24H)</th>
                              <th>High (24H)</th>
                              <th>Low (24h)</th>
                              <th>Volume (24h)</th>
                            </tr>
                          </thead>
                          <tbody> */}
                            <FlipMove typeName='flip-wrapper'>
                            {/* <Flipper
                              flipKey={this.state.data.join("")}
                              element="ul"
                              className="list"
                            > */}
                            {
                              playerdatalist.map((obj, key) => 
                                {
                                  let splitdata = obj.split(' ');
                                  if(!splitdata[0])
                                    return(<></>);
                                  else
                                    return(
                                      <div data-href="exchange-light.html" key={key} flipId={key} className='flip-wrapper'>
                                          <td>
                                            <i className="icon ion-md-star"></i> {splitdata[0]}
                                          </td>
                                          <td>
                                            <img src={'img/icon/1.png'} alt="eth" /> {splitdata[1]}
                                          </td>
                                          <td>{splitdata[2]}</td>
                                          <td className="green">{splitdata[3]}</td>
                                          <td>{splitdata[4]}</td>
                                          <td>{splitdata[5]}</td>
                                          <td>{splitdata[6]}</td>
                                        </div>
                                    )
                                }
                              )
                            }
                            {/* </Flipper> */}
                            </FlipMove>
                          {/* </tbody> */}
                        {/* </table> */}
                      </div>
                    </Tab>
                  </Tabs>
                  <div className="text-center">
                    <a href="#!" className="load-more btn">
                      Load More <i className="icon ion-md-arrow-down"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>

      );
    }else{
      return(
        <>
      </>
      );
    }
  }
}

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps)(RankingsList)