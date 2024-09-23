import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axiosInstance from "../../api/axiosInstance";
import { Navigate, useNavigate } from "react-router-dom";


const Login = () => {
    const navigate = useNavigate()
    
    // console.log(username,password);
    const onFinish = async ({email, password}) => {
        try {
            console.log(email, password);
            const response = await axiosInstance.post('/login', {email, password})
            console.log(response.data, 'hello');
            localStorage.setItem('auth', response.data.token)
            console.log('User LoggedIn',  response.data);
            navigate('/dashboard')
            
        } catch (error) {
            console.log( 'error',  error.message);
            
        }
    }
    

    
  

  return (
    <div className=" shadow-md p-14 rounded-lg bg-purple-100">
        
        <Form
      name="login_form"
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
        
        
      <Form.Item
        name="email"
        rules={[{ required: true, message: "Please input your Email!" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please input your Password!" }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <a className="login-form-forgot" href="">
          Forgot password
        </a>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
        </Button>
        <div className=" pt-4">
        <a href="/register">Register</a>
        </div>
         
      </Form.Item>
    </Form>
    </div>
    
  );
};

export default Login;
