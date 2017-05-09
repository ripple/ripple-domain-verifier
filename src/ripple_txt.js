import {RippleTxtNotFound, ValidationPublicKeyNotFound} from './errors'
import request from 'request-promise'

const urlTemplates = [
  // temporary hack
  'https://{{domain}}/ripple.txt',
  'https://www.{{domain}}/ripple.txt',
  'https://ripple.{{domain}}/ripple.txt',
  'http://{{domain}}/ripple.txt',
  'http://www.{{domain}}/ripple.txt',
  'http://ripple.{{domain}}/ripple.txt'
]

export default class RippleTxt {

  static parse(txt) {
    const sections = { };
    const lines = txt.replace(/\r?\n/g, '\n').split('\n');
    let currentSection = '';
    let line;

    for (let i = 0; i < lines.length; i++) {
      line = lines[i];

      if (!line.length || line[0] === '#') {
        continue;
      }

      if (line[0] === '[' && line[line.length - 1] === ']') {
        currentSection = line.slice(1, line.length - 1);
        sections[currentSection] = [];
      } else {
        line = line.replace(/^\s+|\s+$/g, '');
        if (sections[currentSection]) {
          sections[currentSection].push(line);
        }
      }
    }

    return sections;
  }

  static async get(domain) {
    const self = this;

    return nextUrl(0);

    function nextUrl(i) {
      let url = urlTemplates[i];

      if (url) {
        url = url.replace('{{domain}}', domain);
      } else {
        return {}
      }

      return request({
        method: 'GET',
        uri: url,
        timeout: 5000
      }).then(resp => {
        return self.parse(resp);
      }).catch(e => {
        return nextUrl(i + 1);
      });
    }
  }
}


exports.RippleTxt = RippleTxt;
