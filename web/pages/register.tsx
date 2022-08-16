import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Formik } from 'formik';
import * as yup from 'yup';
import FormInput from '../components/FormInput';

const Register = () => {
  const [formError, setFormError] = useState('');

  const router = useRouter();

  return (
    <div>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        }}
        validationSchema={yup.object({
          firstName: yup.string().required('Required'),
          lastName: yup.string().required('Required'),
          email: yup
            .string()
            .email('Invalid email address')
            .required('Required'),
          password: yup
            .string()
            .required('Required')
            .min(8, 'Password must be at least 8 characters'),
        })}
        onSubmit={async (values) => {
          const response = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
              'Content-type': 'application/json',
            },
          });

          const data = await response.json();

          if (response.status !== 200) {
            setFormError(data.error);
          } else {
            router.push('/');
          }
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            {formError ? <div>{formError}</div> : null}

            <FormInput
              label="First Name"
              name="firstName"
              id="firstname"
              type="text"
              required
            />

            <FormInput
              label="Last Name"
              name="lastName"
              id="lastname"
              type="text"
              required
            />

            <FormInput
              label="Email"
              name="email"
              id="email"
              type="email"
              required
            />

            <FormInput
              label="Password"
              name="password"
              id="password"
              type="password"
              required
            />

            <button type="submit">Register</button>
          </form>
        )}
      </Formik>

      <Link href="/login">
        <a>Login instead</a>
      </Link>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const accessToken = req.cookies.__sess;

  if (!accessToken) {
    return {
      props: {},
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/current`,
    {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        authorization: accessToken,
      },
    }
  );

  const data = await response.json();

  if (data.currentUser) {
    return {
      redirect: {
        destination: '/',
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};

export default Register;
