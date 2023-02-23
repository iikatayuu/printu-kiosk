
import React from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import QrReader, { ScanResult } from 'react-qr-scanner';
import './Homepage.css';

interface HomepageWrapProps {}

interface HomepageProps extends HomepageWrapProps {
  navigate: NavigateFunction;
}

class Homepage extends React.Component<HomepageProps> {
  constructor (props: HomepageProps) {
    super(props);

    this.handleScan = this.handleScan.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleScan (data: ScanResult | null) {
    if (data === null) return;

    const navigate = this.props.navigate;
    const text = data.text;
    navigate(`/print/${text}`);
  }

  handleError (error: string | null) {
    console.error(error);
  }

  render () {
    return (
      <React.Fragment>
        <img src="/images/logo.png" alt="PRINTU Logo" width={170} id="home-logo" />
        <h1 id="home-welcome">Welcome!</h1>

        <img src="/images/qr.png" alt="PRINTU Website QR Code" width={225} id="home-qr" />

        <p className="home-text">JUST ABOUT TO PRINT?</p>
        <p className="home-text">Scan this code to be redirected to our site or go to <span className="link">www.printu.org</span></p>

        <QrReader delay={100} style={{ display: 'none' }} onError={this.handleError} onScan={this.handleScan} />
      </React.Fragment>
    );
  }
}

export default function HomepageWrap (props: HomepageWrapProps) {
  const navigate = useNavigate();
  return <Homepage navigate={navigate} />;
}
