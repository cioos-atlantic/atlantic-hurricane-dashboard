import { useState } from "react";
import path from 'path'
import storm_list from '../data/forecasts/list.json'
import Link from "next/link";
// import fs from 'fs'

export const forecastDataDir = path.join(process.cwd(), 'data/forecasts');

export default function StormDetails(props) {
    // console.log(storm_list)
    return (
        <div className="storm_list">
            <h1>Storm Deets!: {props.name}</h1>
            <div>
                {props.children}
            </div>
            <p>A list of storms</p>
            <ul>
                {storm_list.map(storm => {
                    return <li key={storm.name}><Link href={"/forecast/" + storm.name.toUpperCase()}>{storm.name.toUpperCase()}</Link> ({storm.year}), source: <em>{storm.source}</em></li>
                })}
            </ul>
        </div>
    )
}
