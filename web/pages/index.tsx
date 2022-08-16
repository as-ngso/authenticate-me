import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Formik } from 'formik';
import * as yup from 'yup';
import FormInput from '../components/FormInput';

const Home = ({ user, accessToken }: any) => {
  const [formError, setFormError] = useState('');
  const [currentUser, setCurrentUser] = useState(user);

  const router = useRouter();

  const logout = async () => {
    await fetch('/api/logout', { method: 'DELETE' });
    router.push('/login');
  };

  const logoutFromAllDevices = async () => {
    await fetch('/api/logout?all=true', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <main>
      <button onClick={logout}>Logout</button>
      <button onClick={logoutFromAllDevices}>Logout from all devices</button>
      <div>First name: {currentUser.firstName}</div>
      <div>Last name: {currentUser.lastName}</div>
      <div>Email: {currentUser.email}</div>

      <div>
        <h2>Update user info</h2>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            currentPassword: '',
          }}
          validationSchema={yup.object({
            firstName: yup.string().optional(),
            lastName: yup.string().optional(),
            email: yup.string().optional().email('Invalid email address'),
            password: yup
              .string()
              .optional()
              .min(8, 'Password must be at least 8 characters'),
            currentPassword: yup.string().required('Required').min(8),
          })}
          onSubmit={async (values, { resetForm }) => {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update`,
              {
                method: 'PATCH',
                body: JSON.stringify({
                  password: values.currentPassword,
                  data: {
                    firstName: values.firstName || undefined,
                    lastName: values.lastName || undefined,
                    email: values.email || undefined,
                    password: values.password || undefined,
                  },
                }),
                headers: {
                  'Content-type': 'application/json',
                  authorization: accessToken,
                },
              }
            );

            const data = await response.json();

            setCurrentUser(data.user);

            if (response.status !== 200) {
              setFormError(data.error);
            }

            resetForm();
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
              />

              <FormInput
                label="Last Name"
                name="lastName"
                id="lastname"
                type="text"
              />

              <FormInput label="Email" name="email" id="email" type="email" />

              <FormInput
                label="New Password"
                name="password"
                id="password"
                type="password"
              />

              <FormInput
                label="Current Password"
                name="currentPassword"
                id="currentpassword"
                type="password"
                required
              />

              <button
                disabled={formik.isSubmitting && !formik.isValidating}
                type="submit"
              >
                Update info
              </button>
            </form>
          )}
        </Formik>
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const accessToken = req.cookies.__sess;

  if (!accessToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: true,
      },
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

  if (!data.currentUser) {
    return {
      redirect: {
        destination: '/login',
        permanent: true,
      },
    };
  }

  return {
    props: {
      user: data.currentUser,
      accessToken,
    },
  };
};

export default Home;
