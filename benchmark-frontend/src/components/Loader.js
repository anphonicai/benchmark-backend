import { ThreeDots } from 'react-loader-spinner';

function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <ThreeDots color="#1976d2" height={60} width={60} />
    </div>
  );
}

export default Loader;
