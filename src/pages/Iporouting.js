import React, { useEffect } from 'react';
import Ipo from './ipo';
import Login from './login';
import { connect } from "react-redux";
import { db } from "../components/firebase/firebase";
import interactions from "../IPO/store/interactions";
import { contractsLoadedSelector } from "../store/selectors";
import { useParams } from "react-router-dom";
import { setLoginUserName, setLoginUserEmail } from '../store/actions';
import Swal from 'sweetalert2'

const IpoRouting = (props) => {
    let uid = localStorage.getItem("account-info");
    let { id } = useParams();
    const { loadBalances, loadWeb3, loadAccount, loadToken, loadExchange } =
        !interactions[id] ? interactions["mbappe"] : interactions[id];

    useEffect(() => {
        if (uid) {
            loadBlockchainData(props.dispatch);
        }
    }, []);

    const loadBlockchainData = async (dispatch) => {
        const query = await db.collection("users").doc(uid).get();
        let address = query.data().address;
        let privatekey = query.data().privateKey;
        let name = query.data().Firstname;
        let email = query.data().email;
        const web3 = await loadWeb3(dispatch, address, privatekey);
        const networkId = await web3.eth.net.getId();
        const account = await loadAccount(web3, dispatch);
        localStorage.setItem("account-address",account)
        const token = await loadToken(web3, networkId, dispatch);
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Error...',
                text: "Token smart contract not detected on the current network. Please select another network with Metamask.",
            })
            return;
        }
        const exchange = await loadExchange(web3, networkId, dispatch);
        if (!exchange) {
            Swal.fire({
                icon: 'error',
                title: 'Error...',
                text: "Exchange smart contract not detected on the current network. Please select another network with Metamask.",
                
            })
            
            return;
        }
        await dispatch(setLoginUserName(name));
        await dispatch(setLoginUserEmail(email));
        await loadBalances(dispatch, web3, exchange, token, account);

    };
    return (
        <>
            {
                uid ?
                    <div>
                        {
                            props.contractsLoaded ? <div>
                                <Ipo id={id} />
                            </div> : <></>
                        }
                    </div> : <Login />
            }
        </>
    );
}

function mapStateToProps(state) {
    return {
        contractsLoaded: contractsLoadedSelector(state),
    };
}

export default connect(mapStateToProps)(IpoRouting);