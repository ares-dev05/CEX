import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { auth, db } from "../components/firebase";
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as routes from "../components/constants/routes";
import { withRouter } from "react-router-dom";
import Swal from 'sweetalert2'

const ResetPage = ({ history }) => (
  <div>
    <div className="div-flex">
      <div>
        <Reset history={history} />
      </div>
    </div>
  </div>
);
const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value
});
const INITIAL_STATE = {
  email: "",
  error: null,
  showingAlert: false
};
class Reset extends Component {
  state = { ...INITIAL_STATE };
  onSubmit = event => {
    event.preventDefault();
    const { email} = this.state;
    const { history } = this.props;
    auth
    .doPasswordReset( email)
    .then((res) => {
      this.setState({ ...INITIAL_STATE });
      console.log(res)
      history.push(routes.HOME);
      Swal.fire({
        icon : 'success',
        title : 'Reset Success',
        text : 'Reset Password Success',
      });
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Password Reset Failed, Retry again!",
      });
      this.setState(byPropKey("error", error));
      this.timer(); //defined below
    });
  };
  timer = () => {
    this.setState({
      showingAlert: true
    });

    setTimeout(() => {
      this.setState({
        showingAlert: false
      });
    }, 4000);
  };
  render() {
    const {
      email,
      error,
      showingAlert
    } = this.state;
    //a boolen to perform validation
    const isInvalid =
      email === "" ;
    return (
      <>
        {showingAlert && (
          <Alert color="danger" onLoad={this.timer}>
            {error.message}
          </Alert>
        )}
        <div className="vh-100 d-flex justify-content-center">
          <div className="form-access my-auto">
            <form onSubmit={this.onSubmit}>
              <span>Reset password</span>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  id="exampleemail"
                  placeholder="Your eamil"
                  value={email}
                  onChange={event =>
                    this.setState(byPropKey("email", event.target.value))
                  }
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Reset
              </button>
              <h2>
                Remember Password?
                <Link to="/login"> Sign in here</Link>
              </h2>
            </form>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(ResetPage); //using a HoC to get access to history
export { Reset };