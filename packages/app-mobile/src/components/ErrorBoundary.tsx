import { Component } from "react";
import { Text, View } from "react-native";

type Props = {
  children: JSX.Element | JSX.Element[];
};

export class ErrorBoundary extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <View style={{ flex: 1, backgroundColor: "orange" }}>
          <Text>Something went wrong.</Text>
          <View>
            <Text>{JSON.stringify(this.state, null, 2)}</Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
