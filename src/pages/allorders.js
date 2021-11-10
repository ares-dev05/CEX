import React, { useState, useEffect } from 'react';
import Orders from './orders';
import interactions from "../store/interactions";
import { connect } from 'react-redux'

const Allorders = (props) => {
    let uid = localStorage.getItem("account-info");
    const [id, setId] = useState([]);
    let ids = []
    useEffect(() => {
        if (uid) {
            for (var i = 0; i < Object.entries(interactions).length; i++) {
                ids.push(Object.entries(interactions)[i][0])
            }
            setId(ids);
        }
    }, []);
    return (
        <>
            {
                id.map((obj, key) => (
                    <Orders id={obj} />
                )
                )
            }
        </>
    );
}

function mapStateToProps(state) {
    return {

    };
}

export default connect(mapStateToProps)(Allorders);