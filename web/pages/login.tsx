import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Formik } from 'formik';
import * as yup from 'yup';
import FormInput from '../components/FormInput';

const Login = () => {
  const [formError, setFormError] = useState('');

  const router = useRouter();

  return (
    <div>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={yup.object({
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
          const response = await fetch('/api/login', {
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

            <button
              disabled={formik.isSubmitting && !formik.isValidating}
              type="submit"
            >
              Login
            </button>
          </form>
        )}
      </Formik>

      <Link href="/register">
        <a>Create an account</a>
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

export default Login;
