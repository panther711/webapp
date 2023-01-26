// Editor for a phone number.

import React from 'react';
import { injectIntl } from 'react-intl';
import { getExampleNumber, parsePhoneNumber } from 'libphonenumber-js/mobile';
import examples from 'libphonenumber-js/mobile/examples'

import * as dcodes from '../dcodes.json';
import { flagEmoji } from '../lib/strformat';

class PhoneEdit extends React.PureComponent {
  constructor(props) {
    super(props);

    this.codeMap = {};
    dcodes.default.forEach(dc => { this.codeMap[dc.code] = dc.dial; });

    const code = props.countryCode || 'US';
    const dial = this.codeMap[code];

    this.state = {
      countryCode: code,
      dialCode: dial,
      localNumber: '',
      placeholderNumber: this.placeholderNumber(code, dial)
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleFinished = this.handleFinished.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.showCountrySelector = this.showCountrySelector.bind(this);
  }

  handleChange(e) {
    this.setState({localNumber: this.filterNumber(e.target.value)});
  }

  handleFinished(e) {
    e.preventDefault();
    const raw = `${this.state.dialCode}${this.state.localNumber.trim()}`.replace(/[^\d]/g, '')
    let number = null;
    try {
      number = parsePhoneNumber(raw);
    } catch (err) {}

    if (!number || !number.isValid()) {
      this.inputField.setCustomValidity("Mobile phone number required");
      return;
    }
    this.props.onSubmit(number.format('E.164'));
  }


  handleKeyDown(e) {
    if (e.key === 'Enter') {
      this.handleFinished(e);
    }
  }

  showCountrySelector() {
    this.props.onShowCountrySelector(this.state.countryCode, this.state.dialCode,
      (code, dial) => {
          console.log('Callback', code, dial);
          this.setState({
            countryCode: code,
            dialCode: dial,
            placeholderNumber: this.placeholderNumber(code, dial)
        })
      });
  }

  // Filter out characters not permitted in a phone number.
  filterNumber(number) {
    if (!number) {
      return number;
    }
    // Leave numbers, space, (, ), -, and .
    // The + is not allowed: it's handled by the country code portion.
    return number.replace(/[^-\s().\d]/g, '');
  }

  placeholderNumber(code, dial) {
    console.log('In nplaceholder', code, dial);
    const number = getExampleNumber(code, examples).formatInternational();
    return number.substring(dial.length + 1).trim();
  }

  render() {
    console.log('placeholder:', this.state.placeholderNumber);
    return (
      <>
        <span className="dial-code" onClick={this.showCountrySelector}>
          <span className="country-flag">{flagEmoji(this.state.countryCode)}&nbsp;</span>
          +{this.state.dialCode}&nbsp;</span>
        <input type="tel" ref={ref => {this.inputField = ref}} placeholder={this.state.placeholderNumber}
            value={this.state.localNumber} onChange={this.handleChange}
            maxLength={17} onKeyDown={this.handleKeyDown} onBlur={this.handleFinished}
            required autoFocus={this.props.autoFocus} />
      </>
    );
  }
}

export default injectIntl(PhoneEdit);
