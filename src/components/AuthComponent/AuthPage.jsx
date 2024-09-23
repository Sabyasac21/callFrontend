import { Row, Col } from 'antd';

const AuthPage = ({ children }) => (
  <Row justify="center" align="middle" style={{ height: '80vh' }}>
    <Col span={8}>
      {children}
    </Col>
  </Row>
);

export default AuthPage;
