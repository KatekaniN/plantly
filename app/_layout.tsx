import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Layout() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <Stack>
                    <Stack.Screen
                        name="(tabs)"
                        options={{
                            headerShown: false,
                            animation: 'fade',
                        }}>
                    </Stack.Screen>
                    <Stack.Screen
                        name="onboarding"
                        options={{
                            animation: 'fade',
                            headerShown: false,
                            title: 'Onboarding',
                            presentation: 'modal',
                        }}>
                    </Stack.Screen>
                </Stack >
            </SafeAreaView>
        </SafeAreaProvider >
    )
}