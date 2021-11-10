import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import withAuthorization from "./withAuthorization";
import { db } from "../firebase/firebase";

class HomePage extends Component {
  state = {
    address: "",
    privatekey: "",
    path:"",
  };

  async componentWillMount() {
    const { loggedUser } = this.props;
    const query = await db.collection("users").doc(loggedUser.uid).get();
    if(this.props.location.pathname=='/haaland'){
      this.setState({
      address: query.data().address,
      privatekey: query.data().privateKey,
      path:'haaland',
    });
    }
    if(this.props.location.pathname=='/mbappe'){
      this.setState({
        address: query.data().address,
        privatekey: query.data().privateKey,
        path:'mbappe',
      });
    }
  }

  // render() {
  //   const { address, privatekey,path } = this.state;
  //   return (
  //     <div>
  //       {this.state.address !== "" ? <App {...this.state} /> : <SignInPage />}
  //     </div>
  //   );
  // }
}

const authCondition = authUser => !!authUser;
export default withAuthorization(authCondition)(HomePage); //grants authorization to open endpoint if an user is signed in
