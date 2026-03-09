import { COLORS } from '@/constants';
import { useAuth, useSignUp } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { type Href, Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function Page() {
    const { signUp, errors, fetchStatus } = useSignUp()
    const { isSignedIn } = useAuth()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('');
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const handleSubmit = async () => {


        if (!emailAddress || !password) {
            console.log("teste")
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all fields'
            });
            return;
        }

        console.log("testing..")
        const { error } = await signUp.password({
            emailAddress,
            password,
            firstName,
            lastName
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            return
        }

        if (!error) await signUp.verifications.sendEmailCode()
    }

    const handleVerify = async () => {
        await signUp.verifications.verifyEmailCode({
            code,
        })
        if (signUp.status === 'complete') {
            await signUp.finalize({
                // Redirect the user to the home page after signing up
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        // Handle pending session tasks
                        // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                        console.log(session?.currentTask)
                        return
                    }

                    const url = decorateUrl('/')
                    if (url.startsWith('http')) {
                        window.location.href = url
                    } else {
                        router.push(url as Href)
                    }
                },
            })
        } else {
            // Check why the sign-up is not complete
            console.error('Sign-up attempt not complete:', signUp)
        }
    }

    if (signUp.status === 'complete' || isSignedIn) {
        return null
    }

    if (
        signUp.status === 'missing_requirements' &&
        signUp.unverifiedFields.includes('email_address') &&
        signUp.missingFields.length === 0
    ) {
        return (
          <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <View className="items-center mb-8">
                    <Text className="text-3xl font-bold text-primary mb-2">Verify Email</Text>
                    <Text className="text-secondary text-center">Enter the code sent to your email</Text>
                </View>
                <TextInput
                   className="w-[70%] bg-surface p-4 rounded-xl text-primary text-center tracking-widest"
                    value={code}
                    placeholder="Enter your verification code"
                    placeholderTextColor="#666666"
                    onChangeText={(code) => setCode(code)}
                    keyboardType="numeric"
                />
                {errors.fields.code && (
                    <Text className='text-red-700 text-sm py-2'>{errors.fields.code.message}</Text>
                )}
                <Pressable
                    className="w-[50%] bg-primary py-1 rounded-full my-5"
                    onPress={handleVerify}
                    disabled={fetchStatus === 'fetching'}
                >
                    {fetchStatus === 'fetching' ? (
                        <ActivityIndicator color="#fff" className='py-2'/>
                    ) : (
                        <Text className="text-white font-bold text-lg text-center py-2">
                            Verify
                        </Text>
                    )}
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                    onPress={() => signUp.verifications.sendEmailCode()}
                >
                    <Text className='text-center'>I need a new code</Text>
                </Pressable>
           </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white justify-center" style={{ padding: 28 }}>

            <TouchableOpacity onPress={() => router.push("/")} className="absolute top-12 z-10">
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <View className="items-center mb-8">
                <Text className="text-3xl font-bold text-primary mb-2">Create Account</Text>
                <Text className="text-secondary">Sign up to get started</Text>
            </View>

            <View className="mb-4">
                <Text className="text-primary font-medium mb-2">First Name</Text>
                <TextInput className="w-full bg-surface p-4 rounded-xl text-primary"
                    placeholder="John"
                    placeholderTextColor="#999"
                    value={firstName}
                    onChangeText={setFirstName}
                />
            </View>

            <View className="mb-6">
                <Text className="text-primary font-medium mb-2">Last Name</Text>
                <TextInput className="w-full bg-surface p-4 rounded-xl text-primary"
                    placeholder="Doe"
                    placeholderTextColor="#999"
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>

            <View className="mb-6">
                <Text className="text-primary font-medium mb-2">Email address</Text>
                <TextInput
                    className="w-full bg-surface p-4 rounded-xl text-primary"
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter email"
                    placeholderTextColor="#666666"
                    onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                    keyboardType="email-address"
                />
                    {errors.fields.emailAddress && (
                <Text className='text-red-700 text-sm py-2'>{errors.fields.emailAddress.message}</Text>
            )}
            </View>

            <View className="mb-6">
                <Text className="text-primary font-medium mb-2">Password</Text>
                <TextInput
                    className="w-full bg-surface p-4 rounded-xl text-primary"
                    value={password}
                    placeholder="Enter password"
                    placeholderTextColor="#666666"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                />
                 {errors.fields.password && (
                <Text className='text-red-700 text-sm py-2'>{errors.fields.password.message}</Text>
            )}
            </View>
            <Pressable
                className="w-full bg-primary py-4 rounded-full items-center mb-10"
                onPress={handleSubmit}
                disabled={!emailAddress || !password || fetchStatus === 'fetching'}
            >
                {fetchStatus === 'fetching' ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white text-center font-bold">
                        Sign Up
                    </Text>
                )}
            </Pressable>
            <View className="flex-row justify-center">
                <Text className="text-secondary">Already have an account? </Text>
                <Link href="/sign-in">
                    <Text className="text-primary font-bold">Login</Text>
                </Link>
            </View>

            {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
            <View nativeID="clerk-captcha" />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 12,
    },
    title: {
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#0a7ea4',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        backgroundColor: "red",
        padding: 20
    },
    secondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    secondaryButtonText: {
        color: '#0a7ea4',
        fontWeight: '600',
    },
    linkContainer: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 12,
        alignItems: 'center',
    },
    error: {
        color: '#d32f2f',
        fontSize: 12,
        marginTop: -8,
    },
    debug: {
        fontSize: 10,
        opacity: 0.5,
        marginTop: 8,
    },
})
































