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
          <Text>{this.props.data.collection.id}</Text>
          <Button
            title="View More"
            onPress={() => {
              this.setState({ showMore: true });
            }}
          />
          {this.state.showMore ? (
            <View>
              <Text>{JSON.stringify(this.state, null, 2)}</Text>
            </View>
          ) : null}
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

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
    console.log("NftErrorBoundary:error", this.props.data);
    if (this.state.errorInfo) {
      return (
        <View style={{ padding: 4, flex: 1, backgroundColor: "#EEE" }}>
          <Text>{JSON.stringify({ id: this.props.data.collection.id })}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
