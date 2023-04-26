import { Component } from "react";
import { Text, View, ScrollView, Button } from "react-native";

type Props = {
  data?: any;
  children: JSX.Element | JSX.Element[];
};

export class ErrorBoundary extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null, showMore: false };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <ScrollView style={{ flex: 1, backgroundColor: "orange" }}>
          <Text>Something went wrong.</Text>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

// Wraps individual nft in an error boundary so if it shits, it won't explode the whole app
export class NftErrorBoundary extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null, showMore: false };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.errorInfo) {
      console.error("NftErrorBoundary:error", this.props.data);
      return (
        <View style={{ padding: 4, flex: 1, backgroundColor: "#EEE" }}>
          <Text>{JSON.stringify({ id: this.props.data?.collection?.id })}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
