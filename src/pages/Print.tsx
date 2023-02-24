
import React from 'react';
import { Params, NavigateFunction, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Document } from '../types';
import { delay } from '../utils';
import { ReactComponent as LoadingIcon } from '../assets/loading.svg';
import './Print.css';

interface PrintWrapProps {}

type PrintParams = {
  uploadId: string;
}

interface PrintProps extends PrintWrapProps {
  params: Params;
  navigate: NavigateFunction;
}

interface PrintState {
  data: ArrayBuffer | null;
  document: Document | null;
  loading: boolean;
  printing: number;
  preview: string;
  error: string;
}

class Print extends React.Component<PrintProps, PrintState> {
  constructor (props: PrintProps) {
    super(props);

    this.state = {
      data: null,
      document: null,
      loading: true,
      printing: 0,
      preview: '',
      error: ''
    };

    this.printPage = this.printPage.bind(this);
    this.startPrinting = this.startPrinting.bind(this);
  }

  async printPage (document: Document, buffer: ArrayBuffer, page: number) {
    const server = process.env.REACT_APP_SERVER_API;
    const backend = process.env.REACT_APP_BACKEND_API;
    const uploadId = this.props.params.uploadId;
    if (!uploadId) return false;

    const uint8 = new Uint8Array(buffer);
    const blob = new Blob([uint8]);
    const formData = new FormData();
    formData.set('page', page.toString());
    formData.set('npps', document.npps.toString());
    formData.set('color', document.color);
    formData.set('copies', document.copies.toString());
    formData.set('pdf', blob);

    const printRes = await axios.post(`${backend}/api/print`, formData);
    const preview = printRes.data.preview
    const hash = printRes.data.hash;
    let printed = false;
    let error = false;

    this.setState({ printing: page, preview });
    const timeout = setTimeout(() => {
      error = true;
      printed = true;
    }, 90000);

    while (!printed) {
      await delay(1000);
      const date = new Date();
      const timestamp = date.getTime();
      const checkRes = await axios.get(`${backend}/api/print?t=${timestamp}`);
      const printing = checkRes.data.printing as boolean;
      if (!printing) {
        printed = true;
        clearTimeout(timeout);
      }
    }

    if (error) {
      await axios.delete(`${backend}/api/print`);
      this.setState({
        printing: 0,
        error: 'Printer timed out! Printer could be out of paper or ink. Please try again later'
      });
      return false;
    }

    const params = new URLSearchParams();
    params.set('upload', uploadId);
    params.set('page', page.toString());
    params.set('hash', hash);
    await axios.get(`${server}/printed.php?${params.toString()}`);
    return true;
  }

  async startPrinting (document: Document, buffer: ArrayBuffer) {
    const npps = document.npps;
    const totalPages = Math.ceil(document.pages / npps);
    let allSuccess = true;

    for (let i = document.printed; i < totalPages; i++) {
      const page = i + 1;
      const success = await this.printPage(document, buffer, page);
      if (!success) {
        allSuccess = false;
        break;
      }
    }

    if (allSuccess) {
      const navigate = this.props.navigate;
      const uploadId = this.props.params.uploadId;
      navigate(`/success?filename=${document.filename}&upload=${uploadId}`);
    }
  }

  async redirect () {
    const navigate = this.props.navigate;
    await delay(2500);
    navigate('/');
  }

  async componentDidMount () {
    this.setState({ loading: true });

    const uploadId = this.props.params.uploadId;
    if (!uploadId) {
      this.props.navigate('/');
      return;
    }

    const server = process.env.REACT_APP_SERVER_API;
    const response = await axios.get(`${server}/print.php?upload=${uploadId}`, {
      responseType: 'arraybuffer'
    });

    const docsRes = await axios.get(`${server}/api/document.php?upload=${uploadId}`)
    const document = docsRes.data as Document;

    const pdfBuffer = response.data;
    this.setState({
      data: pdfBuffer,
      document,
      loading: false
    });

    this.startPrinting(document, pdfBuffer);
  }

  render () {
    const document = this.state.document;
    let pageStr = this.state.printing.toString();
    while (pageStr.length < 6) pageStr = `0${pageStr}`;

    if (this.state.error !== '') this.redirect();

    return (
      <React.Fragment>
        {
          this.state.loading && (
            <div className="print-container">
              <h2 className="print-title">Gathering your information</h2>
              <LoadingIcon width={300} height={300} />
              <h2 className="print-title">Please wait...</h2>
            </div>
          )
        }

        {
          this.state.printing > 0 && document !== null && (
            <div className="printing">
              <h2 className="print-title">Printing:</h2>
              <div className="print-filename">{ document.filename }</div>
              <div className="print-page-preview">
                <img src={this.state.preview} alt={`Page ${pageStr}`} width={225} />
              </div>

              <img src="/images/printing.gif" alt="Printing" id="print-gif" width={250} />
            </div>
          )
        }

        {
          this.state.error !== '' && (
            <div className="print-container">
              <h2 className="print-title">{ this.state.error }</h2>
              <p>Redirecting you to homepage</p>
            </div>
          )
        }
      </React.Fragment>
    );
  }
}

export default function PrintWrap (props: PrintWrapProps) {
  const params = useParams<PrintParams>();
  const navigate = useNavigate();
  return <Print params={params} navigate={navigate} />;
}
