import React from 'react';
import { defineMessages } from 'react-intl';

import { Drafty } from 'tinode-sdk';

import LazyImage from '../widgets/lazy-image.jsx'
import UploadingImage from '../widgets/uploading-image.jsx'

import { IMAGE_THUMBNAIL_DIM, BROKEN_IMAGE_SIZE, REM_SIZE } from '../config.js';
import { base64ToBlob, blobToBase64, fitImageSize, imageScaled } from './blob-helpers.js';
import { idToColorClass, shortenFileName } from './strformat.js';
import { cancelablePromise, sanitizeImageUrl } from './utils.js';

const messages = defineMessages({
  drafty_form: {
    id: 'drafty_form',
    defaultMessage: 'Form: ',
    description: 'Comment for form in drafty preview'
  },
  drafty_attachment: {
    id: 'drafty_attachment',
    defaultMessage: 'Attachment',
    description: 'Comment for attachment in drafty preview'
  },
  drafty_image: {
    id: 'drafty_image',
    defaultMessage: 'Picture',
    description: 'Comment for embedded images in drafty preview'
  }
});

// Size the already scaled image.
function handleImageData(el, data, attr) {
  if (!data) {
    attr.src = 'img/broken_image.png';
    attr.style = {
      width: IMAGE_THUMBNAIL_DIM + 'px',
      height: IMAGE_THUMBNAIL_DIM + 'px',
    };
    return el;
  }

  attr.className = 'inline-image';
  const dim = fitImageSize(data.width, data.height,
    this.viewportWidth > 0 ? Math.min(this.viewportWidth - REM_SIZE * 6.5, REM_SIZE * 34.5) :
      REM_SIZE * 34.5, REM_SIZE * 24, false) ||
      {dstWidth: BROKEN_IMAGE_SIZE, dstHeight: BROKEN_IMAGE_SIZE};
  attr.style = {
    width: dim.dstWidth + 'px',
    height: dim.dstHeight + 'px',
    // Looks like a Chrome bug: broken image does not respect 'width' and 'height'.
    minWidth: dim.dstWidth + 'px',
    minHeight: dim.dstHeight + 'px'
  };
  if (!Drafty.isProcessing(data)) {
    attr.src = this.authorizeURL(sanitizeImageUrl(attr.src));
    attr.alt = data.name;
    if (attr.src) {
      if (Math.max(data.width || 0, data.height || 0) > IMAGE_THUMBNAIL_DIM) {
        // Allow previews for large enough images.
        attr.onClick = this.onImagePreview;
        attr.className += ' image-clickable';
      }
      attr.loading = 'lazy';
    } else {
      attr.src = 'img/broken_image.png';
    }
  } else {
    // Use custom element instead of <img>.
    el = UploadingImage;
  }

  return el;
}

function quotedImage(data) {
  let promise;
  // Get the blob from the image data.
  if (data.val) {
    const blob = base64ToBlob(data.val, data.mime);
    promise = blob ? Promise.resolve(blob) : Prmise.reject(new Error("Invalid image"));
  } else {
    promise = fetch(this.authorizeURL(sanitizeImageUrl(data.ref))).then(evt => {
      if (evt.ok) {
        return evt.blob();
      } else {
        throw new Error(`Image fetch unsuccessful: ${evt.status} ${evt.statusText}`);
      }
    });
  }

  // Scale the blob.
  return promise
    .then(blob => {
      return imageScaled(blob, IMAGE_THUMBNAIL_DIM, IMAGE_THUMBNAIL_DIM, -1, true)
    }).then(scaled => {
      data.mime = scaled.mime;
      data.size = scaled.blob.size;
      data.width = scaled.width;
      data.height = scaled.height;
      delete data.ref;
      // Keeping the original file name, if provided: ex.data.name;

      return blobToBase64(scaled.blob);
    }).then(b64 => {
      data.val = b64.bits;
      return data;
    }).catch(err => {
      delete data.val;
      delete data.name;
      data.width = IMAGE_THUMBNAIL_DIM;
      data.height = IMAGE_THUMBNAIL_DIM;
      data.maxWidth = IMAGE_THUMBNAIL_DIM;
      data.maxHeight = IMAGE_THUMBNAIL_DIM;
      // Rethrow.
      throw err;
    });
}

// The main Drafty formatter: converts Drafty elements into React classes. 'this' is set by the caller.
// 'this' must contain:
//    viewportWidth: this.props.viewportWidth;
//    authorizeURL: this.props.tinode.authorizeURL
//    onImagePreview: this.handleImagePreview
//    onFormButtonClick: this.handleFormButtonClick
//    onQuoteClick: this.handleQuoteClick (optional)
export function fullFormatter(style, data, values, key) {
  if (!style) {
    // Unformatted.
    return values;
  }

  if (style == 'HD') {
    // Hidden.
    return null;
  }

  let el = Drafty.tagName(style);
  const attr = Drafty.attrValue(style, data) || {};
  attr.key = key;
  switch (style) {
    case 'HL':
      // Highlighted text. Assign class name.
      attr.className = 'highlight';
      break;
    case 'IM':
      // Additional processing for images
      el = handleImageData.call(this, el, data, attr);
      // Image element cannot have content.
      values = null;
      break;
    case 'BN':
      // Button
      attr.onClick = this.onFormButtonClick;
      let inner = React.Children.map(values, (child) => {
        return typeof child == 'string' ? child : undefined;
      });
      if (!inner || inner.length == 0) {
        inner = [attr.name]
      }
      // Get text which will be sent back when the button is clicked.
      attr['data-title'] = inner.join('');
      break;
    case 'MN':
      // Mention
      attr.className = 'mention'
      if (data) {
        attr.className += ' ' + idToColorClass(data.val, false, true);
      }
      break;
    case 'FM':
      // Form
      attr.className = 'bot-form';
      break;
    case 'RW':
      // Form element formatting is dependent on element content.
      break;
    case 'QQ':
      // Quote/citation.
      attr.className = 'reply-quote'
      attr.onClick = this.onQuoteClick;
      break;
    default:
      if (el == '_UNKN') {
        // Unknown element.
        el = React.Fragment;
        values = [<i className="material-icons gray">extension</i>, ' '].concat(values || []);
      }
      break;
  }
  if (!el) {
    return values;
  }
  return React.createElement(el, attr, values);
};

// Converts Drafty object into a one-line preview. 'this' is set by the caller.
// 'this' must contain:
//    formatMessage: this.props.intl.formatMessage
//    messages: formatjs messages defined with defineMessages.
export function previewFormatter(style, data, values, key) {
  if (!style) {
    // Unformatted.
    return values;
  }

  if (style == 'HD') {
    // Hidden.
    return null;
  }

  let el = Drafty.tagName(style);
  const attr = { key: key };
  switch (style) {
    case 'BR':
      // Replace new line with a space.
      el = React.Fragment;
      values = [' '];
      break;
    case 'HL':
      // Make highlight less prominent in preview.
      attr.className = 'highlight preview';
      break;
    case 'LN':
    case 'MN':
      // Disable links in previews.
      el = 'span';
      break;
    case 'IM':
      // Replace image with '[icon] Image'.
      el = React.Fragment;
      values = [<i key="im" className="material-icons">photo</i>, this.formatMessage(messages.drafty_image)];
      break;
    case 'BN':
      el = 'span';
      attr.className = 'flat-button faux';
      break;
    case 'FM':
      el = React.Fragment;
      values = [<i key="fm" className="material-icons">dashboard</i>,
        this.formatMessage(messages.drafty_form)].concat(' ', values || []);
      break;
    case 'RW':
      el = React.Fragment;
      break;
    case 'EX':
      if (data) {
        if (data.mime == 'application/json') {
          // Ignore JSON attachments: they are form response payloads.
          return null;
        }
        // Clear payload.
        delete data.val;
        delete data.ref;
      }
      el = React.Fragment;
      values = [<i key="ex" className="material-icons">attachment</i>, this.formatMessage(messages.drafty_attachment)];
      break;
    default:
      if (el == '_UNKN') {
        el = React.Fragment;
        values = [<i key="unkn" className="material-icons">extension</i>, ' '].concat(values || []);
      }
      break;
  }
  if (!el) {
    return values;
  }
  return React.createElement(el, attr, values);
};

// Converts Drafty object into a quoted reply. 'this' is set by the caller.
function inlineImageAttr(attr, data) {
  attr.style = {
    width: IMAGE_THUMBNAIL_DIM + 'px',
    height: IMAGE_THUMBNAIL_DIM + 'px',
    maxWidth: IMAGE_THUMBNAIL_DIM + 'px',
    maxHeight: IMAGE_THUMBNAIL_DIM + 'px',
  }
  attr.className = 'inline-image';
  attr.alt = this.formatMessage(messages.drafty_image);
  if (!data) {
    attr.src = 'img/broken_image.png';
  }
  attr.title = attr.alt;
  return attr;
}

// Displays a portion of Drafty within 'QQ' quotes. 'this' is set by the caller.
// 'this' must contain:
//    formatMessage: this.props.intl.formatMessage
//    messages: formatjs messages defined with defineMessages.
//    authorizeURL: this.props.tinode.authorizeURL
//    onQuoteClick: this.handleQuoteClick (optional)
export function quoteFormatter(style, data, values, key) {
  if (['BR', 'EX', 'IM', 'MN', 'QQ'].includes(style)) {
    let el = Drafty.tagName(style);
    let attr = Drafty.attrValue(style, data) || {};
    attr.key = key;
    switch(style) {
      case 'IM':
        attr = inlineImageAttr.call(this, attr, data);
        values = [React.createElement('img', attr, null), ' ', attr.alt];
        el = React.Fragment;
        // Fragment attributes.
        attr = {key: key};
        break;
      case 'MN':
        el = 'span';
        attr.className = 'mention'
        if (data) {
          attr.className += ' ' + idToColorClass(data.val, false, true);
        }
        break;
      case 'QQ':
        attr.className = 'reply-quote';
        attr.onClick = this.onQuoteClick;
        break;
      case 'EX':
        let fname;
        if (data) {
          if (data.mime == 'application/json') {
            // Ignore JSON attachments: they are form response payloads.
            return null;
          }
          fname = data.name;
          // Clear payload.
          delete data.val;
          delete data.ref;
        }
        el = React.Fragment;
        values = [<i key="ex" className="material-icons">attachment</i>,
          shortenFileName(fname, 16) || this.formatMessage(messages.drafty_attachment)];
        break;
    }
    return React.createElement(el, attr, values);
  }
  return previewFormatter.call(this, style, data, values, key);
}

// Create image thumbnail suitable for inclusion in a quote.
function quoteImage(data) {
  let promise;
  // Get the blob from the image data.
  if (data.val) {
    const blob = base64ToBlob(data.val, data.mime);
    promise = blob ? Promise.resolve(blob) : Promise.reject(new Error("Invalid image"));
  } else {
    promise = fetch(this.authorizeURL(sanitizeImageUrl(data.ref))).then(evt => {
      if (evt.ok) {
        return evt.blob();
      } else {
        throw new Error(`Image fetch unsuccessful: ${evt.status} ${evt.statusText}`);
      }
    });
  }

  // Scale the blob.
  return promise
    .then(blob => {
      // Cut the square from the center of the image and shrink it.
      return imageScaled(blob, IMAGE_THUMBNAIL_DIM, IMAGE_THUMBNAIL_DIM, -1, true)
    }).then(scaled => {
      data.mime = scaled.mime;
      data.size = scaled.blob.size;
      data.width = scaled.width;
      data.height = scaled.height;
      delete data.ref;
      // Keeping the original file name, if provided: ex.data.name;

      data.src = URL.createObjectURL(scaled.blob);
      return blobToBase64(scaled.blob);
    }).then(b64 => {
      data.val = b64.bits;
      return data;
    }).catch(err => {
      delete data.val;
      delete data.src;
      data.width = IMAGE_THUMBNAIL_DIM;
      data.height = IMAGE_THUMBNAIL_DIM;
      // Rethrow.
      throw err;
    });
}

// Create a preview of a reply.
export function replyFormatter(style, data, values, key) {
  if (style != 'IM') {
    return quoteFormatter.call(this, style, data, values, key);
  }
  const attr = inlineImageAttr.call(this, {key: key}, data);
  attr.whenDone = cancelablePromise(quoteImage.call(this, data));
  values = [React.createElement(LazyImage, attr, null), ' ', attr.alt];
  return React.createElement(React.Fragment, {key: key}, values);
}
