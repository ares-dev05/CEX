import { connect } from 'react-redux'
import React, { Component} from 'react'
import { Navbar, Nav, NavDropdown, Dropdown, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import ProfileImage from '../components/Players/ErlingHaaland/profile.jpg';
// import description from '../components/Players/ErlingHaaland/description.js';

import configURL from '../config/config.json'
const IMGURL = configURL.imgURL;
const DATAURL = configURL.playerdataURL;
const player2id = configURL.player2id;
class AboutPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgurl : null,
      fullname : null,
      nationality : null,
      birthday : null,
      height : null,
      weight : null,
      error : null
    }

    this.getFullData = this.getFullData.bind(this);
  }

  // getFullName(){
  //   return this.state.fulldata.fullname;
  // }

  getImgUrl(){
    let playerName = this.props.id, id;
    id = player2id[playerName];
    return IMGURL+id+'.png';
  }

  async getFullData(){
    let playerName = this.props.id, id, url, fulldata;
    id = player2id[playerName];
    url = DATAURL + id;
    await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "text/plain"
      }
    }).then(response => response.json())
    .then(data => {
      fulldata = data;
    }).catch(error => {
      this.setState({error : error});
    });
    return fulldata;
  }


  render(){
    return (
      <>
        <div className="market-news mt15">
          <h2 className="heading">{this.state.fullname}</h2>
          <ul>
            <li>
              <Link to="/news-details">

                <img className="ProfileImage" src={this.state.imgurl} /><p />
                <div>
                <h6>FULLNAME : <small>{this.state.fullname}</small></h6>
                <h6>NATIONALITY : <small>{this.state.nationality}</small></h6>
                <h6>BIRTHDAY : <small>{this.state.birthday}</small></h6>
                <h6>HEIGHT : <small>{this.state.height}</small></h6>
                <h6>WEIGHT : <small>{this.state.weight}</small></h6>
                </div>

              </Link>
            </li>
          </ul>
        </div>
      </>
    );
  }

  async componentDidMount(){
    let fulldata = await this.getFullData();
    this.setState({imgurl : this.getImgUrl()});
    if(fulldata){
      this.setState({
      fullname : fulldata.fullname,
      nationality : fulldata.nationality,
      birthday : fulldata.birthdate,
      height : fulldata.height,
      weight : fulldata.weight
      });
    }
  }
}
function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps)(AboutPlayer)