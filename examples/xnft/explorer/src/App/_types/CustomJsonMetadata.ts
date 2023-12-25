type BundleType = "iframe" | "native";

interface CustomJsonMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  properties: MetadataProperties;
}

interface MetadataProperties {
  bundle: string;
  bundle_type: BundleType;
  files: PropertiesFile[];
  versions: BundleVersion[];
}

interface BundleVersion {
  created_at: string | Date;
  uri: string;
}

interface PropertiesFile {
  uri: string;
  type: string;
}

export default CustomJsonMetadata;
