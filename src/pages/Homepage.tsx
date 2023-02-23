
import React from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import QrReader, { ScanResult } from 'react-qr-scanner';
import './Homepage.css';

interface HomepageWrapProps {}

interface HomepageProps extends HomepageWrapProps {
  navigate: NavigateFunction;
}

interface HomepageState {
  page: number;
}

class Homepage extends React.Component<HomepageProps, HomepageState> {
  interval: ReturnType<typeof setInterval> | undefined;

  constructor (props: HomepageProps) {
    super(props);

    this.state = {
      page: 1
    };

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

  componentDidMount () {
    this.interval = setInterval(() => {
      const page = this.state.page;
      this.setState({ page: page === 1 ? 2 : 1 });
    }, 5000);
  }

  render () {
    return (
      <React.Fragment>
        <img src="/images/logo.png" alt="PRINTU Logo" width={170} id="home-logo" />
        <h1 id="home-welcome">Welcome!</h1>

        {
          this.state.page === 1 && (
            <React.Fragment>
              <img src="/images/qr.png" alt="PRINTU Website QR Code" width={225} id="home-qr" />

              <p className="home-text">JUST ABOUT TO PRINT?</p>
              <p className="home-text">Scan this code to be redirected to our site or go to <span className="link">www.printu.org</span></p>
            </React.Fragment>
          )
        }

        {
          this.state.page === 2 && (
            <React.Fragment>
              <div className="home-image-ptr">
                <img src="/images/welcome.png" alt="PRINTU Welcome" width={225} />
                <img src="/images/pointer.png" alt="Welcome pointer" width={150} className="home-ptr" />
              </div>

              <p className="home-text">Scan your QR code in the scanning tray</p>
            </React.Fragment>
          )
        }

        <QrReader delay={100} style={{ display: 'none' }} onError={this.handleError} onScan={this.handleScan} />
      </React.Fragment>
    );
  }
}

export default function HomepageWrap (props: HomepageWrapProps) {
  const navigate = useNavigate();
  return <Homepage navigate={navigate} />;
}
