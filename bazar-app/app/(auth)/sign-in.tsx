import { COLORS } from '@/constants'
import { useSignIn } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Page() {
    const { signIn, errors, fetchStatus } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [code, setCode] = React.useState('')

    const handleSubmit = async () => {
        const { error } = await signIn.password({
            emailAddress,
            password,
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            return
        }

        if (signIn.status === 'complete') {
            await signIn.finalize({
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
        } else if (signIn.status === 'needs_second_factor') {
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
        } else if (signIn.status === 'needs_client_trust') {
            // For other second factor strategies,
            // see https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === 'email_code',
            )

            if (emailCodeFactor) {
                await signIn.mfa.sendEmailCode()
            }
        } else {
            // Check why the sign-in is not complete
            console.error('Sign-in attempt not complete:', signIn)
        }
    }

    const handleVerify = async () => {
        await signIn.mfa.verifyEmailCode({ code })

        if (signIn.status === 'complete') {
            await signIn.finalize({
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
            // Check why the sign-in is not complete
            console.error('Sign-in attempt not complete:', signIn)
        }
    }

    if (signIn.status === 'needs_client_trust') {
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
                           onPress={() => signIn.mfa.sendEmailCode()}
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
                <Text className="text-3xl font-bold text-primary mb-2">Welcome Back</Text>
                <Text className="text-secondary">Sign in to continue</Text>
            </View>
            <View className='mb-4'>
                <Text className="text-primary font-medium mb-2">Email address</Text>
                <TextInput
                    className="w-full bg-surface p-4 rounded-xl text-primary"
                    placeholder="user@example.com"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={emailAddress}
                    onChangeText={(emailAddress) => setEmailAddress(emailAddress)}

                />
                {errors.fields.identifier && (
                    <Text className='text-red-600 text-sm py-2'>{errors.fields.identifier.message}</Text>
                )}
            </View>

            <View className='mb-4'>

                <Text className="text-primary font-medium mb-2">Password</Text>
                <TextInput
                    className="w-full bg-surface p-4 rounded-xl text-primary" placeholder="********" placeholderTextColor="#999" secureTextEntry
                    value={password}
                    onChangeText={(password) => setPassword(password)}
                />
                {errors.fields.password && (
                    <Text className='text-red-600 text-sm py-2'>{errors.fields.password.message}</Text>
                )}
            </View>
            <Pressable
            className={`w-full py-4 rounded-full items-center mb-10 ${fetchStatus === 'fetching'|| !emailAddress || !password ? "bg-gray-300" : "bg-primary"}`}
                onPress={handleSubmit}
                disabled={!emailAddress || !password || fetchStatus === 'fetching'}
            >
                {fetchStatus === 'fetching' ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white text-center font-bold text-lg">
                        Sign In
                    </Text>
                )}
            </Pressable>

            <View className="flex-row justify-center">
                <Text className="text-secondary">Don&apos;t have an account? </Text>
                <Link href="/sign-up">
                    <Text className="text-primary font-bold">Sign up</Text>
                </Link>
            </View>
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









































// import { COLORS } from "@/constants";
// import { useSignIn } from "@clerk/expo";
// import type { EmailCodeFactor } from "@clerk/types";
// import { Ionicons } from "@expo/vector-icons";
// import { Link, useRouter } from "expo-router";
// import * as React from "react";
// import { ActivityIndicator, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function Page() {
//     const { signIn, setActive, isLoaded } = useSignIn();
//     const router = useRouter();

//     const [emailAddress, setEmailAddress] = React.useState("");
//     const [password, setPassword] = React.useState("");
//     const [code, setCode] = React.useState("");
//     const [showEmailCode, setShowEmailCode] = React.useState(false);
//     const [loading, setLoading] = React.useState(false);

//     const onSignInPress = async () => {

//         if (!isLoaded) return;
//         if (!emailAddress || !password) return;

//         setLoading(true);

//         try {

//             const signInAttempt = await signIn.create({
//                 identifier: emailAddress,
//                 password,
//             });

//             if (signInAttempt.status === "complete") {
//                 await setActive({
//                     session: signInAttempt.createdSessionId,
//                 });
//                 router.replace("/");
//             } else if (signInAttempt.status === "needs_second_factor") {
//                 const emailCodeFactor = signInAttempt.supportedSecondFactors?.find((factor): factor is EmailCodeFactor => factor.strategy === "email_code");

//                 if (emailCodeFactor) {
//                     await signIn.prepareSecondFactor({
//                         strategy: "email_code",
//                         emailAddressId: emailCodeFactor.emailAddressId,
//                     });
//                     setShowEmailCode(true);
//                 }
//             }
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const onVerifyPress = async () => {
//         if (!isLoaded || !code) return;

//         setLoading(true);
//         try {
//             const attempt = await signIn.attemptSecondFactor({
//                 strategy: "email_code",
//                 code,
//             });

//             if (attempt.status === "complete") {
//                 await setActive({
//                     session: attempt.createdSessionId,
//                 });
//                 router.replace("/");
//             }
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <SafeAreaView className="flex-1 bg-white justify-center" style={{ padding: 28 }}>
//             {!showEmailCode ? (
//                 <>
//                     <TouchableOpacity onPress={() => router.push("/")} className="absolute top-12 z-10">
//                         <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
//                     </TouchableOpacity>

//                     {/* Header */}
// <View className="items-center mb-8">
//     <Text className="text-3xl font-bold text-primary mb-2">Welcome Back</Text>
//     <Text className="text-secondary">Sign in to continue</Text>
// </View>

//                     {/* Email */}
// <View className="mb-4">
//     <Text className="text-primary font-medium mb-2">Email</Text>
//     <TextInput className="w-full bg-surface p-4 rounded-xl text-primary" placeholder="user@example.com" placeholderTextColor="#999" autoCapitalize="none" keyboardType="email-address" value={emailAddress} onChangeText={setEmailAddress} />
// </View>

// {/* Password */}
// <View className="mb-6">
//     <Text className="text-primary font-medium mb-2">Password</Text>
//     <TextInput className="w-full bg-surface p-4 rounded-xl text-primary" placeholder="********" placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} />
// </View>

//                     {/* Submit */}
//                     <Pressable className={`w-full py-4 rounded-full items-center mb-10 ${loading || !emailAddress || !password ? "bg-gray-300" : "bg-primary"}`} onPress={onSignInPress} disabled={loading || !emailAddress || !password}>
//                         {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Sign In</Text>}
//                     </Pressable>

//                     {/* Footer */}
                    // <View className="flex-row justify-center">
                    //     <Text className="text-secondary">Don&apos;t have an account? </Text>
                    //     <Link href="/sign-up">
                    //         <Text className="text-primary font-bold">Sign up</Text>
                    //     </Link>
                    // </View>
//                 </>
//             ) : (
//                 <>
//                     {/* Verification */}
//                     <View className="items-center mb-8">
//                         <Text className="text-3xl font-bold text-primary mb-2">Verify Email</Text>
//                         <Text className="text-secondary text-center">Enter the code sent to your email</Text>
//                     </View>

//                     <View className="mb-6">
//                         <TextInput className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest" placeholder="123456" placeholderTextColor="#999" keyboardType="number-pad" value={code} onChangeText={setCode} />
//                     </View>

//                     <Pressable className="w-full bg-primary py-4 rounded-full items-center" onPress={onVerifyPress} disabled={loading}>
//                         {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Verify</Text>}
//                     </Pressable>
//                 </>
//             )}
//         </SafeAreaView>
//     );
// }
