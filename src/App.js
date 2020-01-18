import React from "react";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Button from "react-bootstrap/Button";
import matcher from "problem-matcher";

const examples = {
  "eslint-compact": [
    {
      owner: "eslint-compact",
      pattern: [
        {
          regexp:
            "^(.+):\\sline\\s(\\d+),\\scol\\s(\\d+),\\s(Error|Warning|Info)\\s-\\s(.+)\\s\\((.+)\\)$",
          file: 1,
          line: 2,
          column: 3,
          severity: 4,
          message: 5,
          code: 6
        }
      ]
    },
    "badFile.js: line 50, col 11, Error - 'myVar' is defined but never used. (no-unused-vars)"
  ],
  "eslint-stylish": [
    {
      owner: "eslint-stylish",
      pattern: [
        {
          // Matches the 1st line in the output
          regexp: "^([^\\s].*)$",
          file: 1
        },
        {
          // Matches the 2nd and 3rd line in the output
          regexp:
            "^\\s+(\\d+):(\\d+)\\s+(error|warning|info)\\s+(.*)\\s\\s+(.*)$",
          // File is carried through from above, so we define the rest of the groups
          line: 1,
          column: 2,
          severity: 3,
          message: 4,
          code: 5,
          loop: true
        }
      ]
    },
    `test.js
  1:0   error  Missing "use strict" statement                 strict
  5:10  error  'addOne' is defined but never used             no-unused-vars

foo.js
  36:10  error  Expected parentheses around arrow function argument  arrow-parens
  37:13  error  Expected parentheses around arrow function argument  arrow-parens

✖ 4 problems (4 errors, 0 warnings)`
  ]
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      output: "",
      matcher: "",
      matches: ""
    };

    window.state = this.state;
    this.handleOutputChange = this.handleOutputChange.bind(this);
    this.handleMatcherChange = this.handleMatcherChange.bind(this);
    this.loadExample = this.loadExample.bind(this);
  }

  loadExample(index) {
    let example = examples[index];
    document.getElementById("matcher").value = JSON.stringify(
      example[0],
      true,
      2
    );
    document.getElementById("output").value = example[1];
    this.setState(
      {
        matcher: example[0],
        output: example[1]
      },
      this.captureMatches
    );
  }

  handleOutputChange(event) {
    this.setState({ output: event.target.value }, this.captureMatches);
  }

  handleMatcherChange(event) {
    try {
      let matcher = JSON.parse(event.target.value);

      this.setState(
        { matcherError: false, matcher: matcher },
        this.captureMatches
      );
    } catch (e) {
      this.setState({ matcherError: true });
    }
  }

  captureMatches() {
    try {
      console.log(this.state);
      this.setState({
        error: "",
        matches: matcher(this.state.matcher, this.state.output)
      });
    } catch (e) {
      this.setState({ error: e.message });
    }
  }

  render() {
    let errorOutput = "";
    if (this.state.error) {
      errorOutput = <Alert variant="danger">{this.state.error}</Alert>;
    }

    let bookToolbar = "";
    if (this.state.matches) {
      bookToolbar = (
        <Alert variant="success">
          Congratulations, your Problem Matcher works! If you're interested in
          learning more about Github Actions, you might find{" "}
          <a href="https://michaelheap.com/building-github-actions/">
            Building Github Actions
          </a>{" "}
          useful
        </Alert>
      );
    }

    return (
      <div className="App">
        {bookToolbar}
        <span>Examples:</span>
        <ButtonToolbar>
          <Button
            variant="primary"
            onClick={() => this.loadExample("eslint-compact")}
          >
            ESLint Compact
          </Button>
          <Button
            variant="secondary"
            onClick={() => this.loadExample("eslint-stylish")}
          >
            ESLint Stylish
          </Button>
        </ButtonToolbar>
        <br />
        <Form>
          <Form.Group>
            <Form.Label>Example Logs Output</Form.Label>
            <Form.Control
              id="output"
              as="textarea"
              rows="3"
              onChange={this.handleOutputChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Problem Matcher</Form.Label>
            <Form.Control
              id="matcher"
              as="textarea"
              rows="10"
              onChange={this.handleMatcherChange}
              isValid={this.state.matcher && !this.state.matcherError}
              isInvalid={this.state.matcherError}
            />
          </Form.Group>

          <Form.Label>Output</Form.Label>
          {errorOutput}
          <pre>
            <code>{JSON.stringify(this.state.matches || {}, true, 4)}</code>
          </pre>
        </Form>
      </div>
    );
  }
}

export default App;
