var eighty = require('eighty');
var cardinal = require('cardinal');
var marked = require('marked');

var tokens
  , token;

function next() {
  return token = tokens.pop();
}

function tok() {
  switch (token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return eighty.hr() + '\n';
    }
    case 'heading': {
      return Array(token.depth + 1).join('#')
        + ' '
        + token.text
        + '\n\n';
    }
    case 'code': {
      var c = '';
      try {
        c += cardinal.highlight(token.text);
      } catch (e) {
        // cardinal will fail if the code is mal-formed javascript
        // ...which happens in readmes, sometimes. just display it
        // without pretty colors
        c += token.text;
      }
      return c + '\n\n';
    }
    case 'blockquote_start': {
      var body = '';

      while (next().type !== 'blockquote_end') {
        body += tok();
      }
      //console.log('body', body, 'body')

      return eighty.blockquote(body) + '\n\n';
    }
    case 'list_start': {
      var type = token.ordered ? 'ol' : 'ul'
        , body = '';

      while (next().type !== 'list_end') {
        body += tok();
      }

      return '<'
        + type
        + '>\n'
        + body
        + '</'
        + type
        + '>\n';
    }
    case 'list_item_start': {
      var body = '';

      while (next().type !== 'list_item_end') {
        body += token.type === 'text'
          ? parseText()
          : tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'loose_item_start': {
      var body = '';

      while (next().type !== 'list_item_end') {
        body += tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'html': {
      return token.text;
    }
    case 'paragraph': {
      return token.text + '\n';
    }
    case 'text': {
      return '<p>'
        + token.text
        + '</p>\n';
    }
  }
}

function parse(src) {
  //console.log(src);
  tokens = src.reverse();

  var out = '';
  while (next()) {
    out += tok();
  }

  tokens = null;
  token = null;

  return out;
}

function conch (md) {
  return parse(marked.lexer(md));
}
conch.parse = parse;

module.exports = conch;