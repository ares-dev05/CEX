import React, { useState, useEffect } from 'react';
import HistoryOrderIPO from '../components/HistoryOrderIPO';
import interactions from "../store/interactions";
import Login from './login';
import { connect } from 'react-redux'

const Orders = (props) => {
    let uid = localStorage.getItem("account-info");
    const [id, setId] = useState([]);
    const [flag,setFlag]=useState(false);
    let ids = []
    useEffect(() => {
        if (uid) {
            for (var i = 0; i < Object.entries(interactions).length; i++) {
                ids.push(Object.entries(interactions)[i][0])
            }
            if(ids.length>0){
                setFlag(true)
            }
            setId(ids);
        }
    }, []);


    return (
        <>
            {
                uid ?
                    <div>
                        <ul className="d-flex justify-content-between market-order-item">
                            <li className="amount-type" >Name</li>
                            <li className="amount-type" >Time</li>
                            <li className="amount-type" >Buy/Sell</li>
                            <li className="amount-type" >Price</li>
                            <li className="amount-type" >Amount</li>
                        </ul>
                                {flag&&<HistoryOrderIPO id={id} />}
                    </div> : <Login />
            }
        </>
    );
}

function mapStateToProps(state) {
    return {
    };
}

export default connect(mapStateToProps)(Orders);
