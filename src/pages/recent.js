import React, { useState, useEffect } from 'react';
import Recentall from '../components/Recentall';
import interactions from "../store/interactions";
import Login from './login';
import { connect } from 'react-redux'

const Recent = (props) => {
    let uid = localStorage.getItem("account-info");
    const [id, setId] = useState([]);
    const [flag, setFlag] = useState(false);
    let ids = []
    useEffect(() => {
        if (uid) {
            for (var i = 0; i < Object.entries(interactions).length; i++) {
                ids.push(Object.entries(interactions)[i][0])
            }
            if (ids.length > 0) {
                setFlag(true)
            }
            setId(ids);
        }
    }, []);


    return (
        <>
            {
                uid ?
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Time</th>
                                <th>Price(BTC)</th>
                                <th>Amount(ETH)</th>
                            </tr>
                        </thead>
                        {flag&&<Recentall id={id} />}
                    </table>
                    : <Login />
            }
        </>
    );
}

function mapStateToProps(state) {
    return {
    };
}

export default connect(mapStateToProps)(Recent);
