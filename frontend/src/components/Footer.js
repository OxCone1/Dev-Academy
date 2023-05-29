import React from 'react'
import myLogo from '../assets/Logo_v1_snow.png'

function Footer() {
    return (
        <div className='footer'>
            <div className='source'>
                <span>&copy;Helsingin Seudun Liikenteen (HSL)</span>
                <div className='dataLicense'>
                    <a href='https://opendata.arcgis.com/datasets/726277c507ef4914b0aec3cbcfcbfafc_0.csv' target='_blank' rel='noreferrer'>Data</a>
                    <a href='https://www.avoindata.fi/data/en/dataset/hsl-n-kaupunkipyoraasemat/resource/a23eef3a-cc40-4608-8aa2-c730d17e8902' target='_blank' rel='noreferrer'>License</a>
                </div>
            </div>
            <div className='purpose'>
                <span>Solita Dev Academy 2023</span>
            </div>
            <div className='author'>
                <span>Page by OxCone</span>
                <img src={myLogo} alt="" />
            </div>
        </div>
    )
}

export default Footer
