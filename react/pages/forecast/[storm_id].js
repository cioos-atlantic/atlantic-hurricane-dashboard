import dynamic from 'next/dynamic';
import Head from 'next/head'
import Layout from "../../components/layout";
import storm_list from '../../data/forecasts/list.json'
import path from 'path'
import { forecastDataDir } from '@/lib/storms'
import Link from 'next/link';

export async function getStaticProps({ params }) {
    const storm_list_data = storm_list.find(storm => { return storm.name === params.storm_id })
    const source_path = path.join(forecastDataDir, `${storm_list_data.source}/${params.storm_id}/index.json`)

    // Add file system reader
    const fs = require('fs')

    // Read index file of ECCC storm data
    const source_data = JSON.parse(fs.readFileSync(source_path))

    const stormData = { ...storm_list_data, dates: source_data }

    return {
        props: {
            stormData,
        },
    };
}

export async function getStaticPaths() {
    const paths = storm_list.map((storm) => {
        return {
            params: {
                storm_id: storm.name,
            },
        };
    });

    return {
        paths,
        fallback: false,
    };
}

export default function Storm({ stormData }) {
    // console.log(stormData.dates)
    return (
        <Layout>
            <Head>
                <title>Atlantic Hurricane Dashboard - {stormData.name} ({stormData.year})</title>
            </Head>
            <article>
                <h1>{stormData.name} ({stormData.year})</h1>
                <div>
                    <p>Storm Details:</p>
                    <ul>
                        {
                            stormData.dates.map(storm_date => {
                                return <li key={storm_date.date + storm_date.time + storm_date.type}>{`${storm_date.date} ${storm_date.time} ${storm_date.type}: ${storm_date.path}`}</li>
                            })
                        }
                    </ul>
                </div>
            </article>
        </Layout>
    )
}
