
import React from 'react';
import { NavigateFunction, useNavigate, useSearchParams } from 'react-router-dom';

import './Success.css';

interface SuccessWrapProps {}

interface SuccessProps extends SuccessWrapProps {
  searchParams: URLSearchParams;
  navigate: NavigateFunction;
}

class Success extends React.Component<SuccessProps> {
  componentDidMount () {
    setTimeout(() => {
      const navigate = this.props.navigate;
      navigate('/');
    }, 10000);
  }

  render () {
    const server = process.env.REACT_APP_SERVER_API;
    const searchParams = this.props.searchParams;
    const filename = searchParams.get('filename') || '';
    const uploadId = searchParams.get('upload') || '';
    return (
      <React.Fragment>
        <h2 className="success-title">Thank you for using Printu!</h2>
        <div className="success-feedback">
          <img src="/images/feedback.png" alt="Feedback link QR code" width={128} />
          <div className="success-feedback-text">
            <div className="text-center mb-2">How was your experience with us?</div>
            <div className="text-center">Your feedback will be much appreciated, just scan the QR code to open the survey form.</div>
          </div>
        </div>

        <h2 className="success-title">Printing:</h2>
        <div className="success-filename">{ filename }</div>
        <div className="success-preview">
          <img src={`${server}/api/data/${uploadId}-000001.png`} alt="Success preview" width={250} />
          <img src="/images/success.gif" alt="Print preview" className="success-preview-gif" />
        </div>
      </React.Fragment>
    );
  }
}

export default function SuccessWrap (props: SuccessWrapProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return <Success searchParams={searchParams} navigate={navigate} />
}
