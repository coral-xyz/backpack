export default function generateMetadata(data: any) {
  const metadata = {
    name: data.title,
    description: data.description,
    external_url: data.bundle,
    code: {
      icon: data.icon,
    },
  };

  return metadata;
}
