import {FontAwesome5} from "@expo/vector-icons";
import {Tabs} from "expo-router";
import {Platform} from "react-native";
import {Theme} from "@/constants/Theme";
import {AuthProvider} from "@/contexts/AuthContext";
import {GameProvider} from "@/contexts/GameContext";
import {LoginProvider} from "@/contexts/LoginContext";

export default function TabsLayout() {
    return (
        <AuthProvider>
            <LoginProvider>
                <GameProvider>
                    <Tabs
                        initialRouteName="(auth)/sign-in"
                        screenOptions={{
                            tabBarStyle: {
                                backgroundColor: Theme.colors.bg,
                                borderTopWidth: 2,
                                borderTopColor: Theme.colors.border,
                                height: Platform.OS === 'ios' ? 88 : 68,
                                paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                                paddingTop: 8,
                            },
                            tabBarActiveTintColor: Theme.colors.accent,
                            tabBarInactiveTintColor: Theme.colors.textFaint,
                            tabBarLabelStyle: {
                                fontFamily: Theme.typography.fontPixel,
                                fontSize: 12,
                                marginTop: 4,
                            },
                            headerStyle: {
                                backgroundColor: Theme.colors.bg,
                                borderBottomWidth: 2,
                                borderBottomColor: Theme.colors.border,
                            },
                            headerTitleStyle: {
                                fontFamily: Theme.typography.fontPixel,
                                fontSize: Theme.typography.sizes.large,
                            },
                            headerTintColor: Theme.colors.text,
                            lazy: false, // Preload all tabs
                        }}
                    >
                        <Tabs.Screen
                            name="home"
                            options={{
                                title: "Home",
                                tabBarIcon: ({color, size}) => (
                                    <FontAwesome5 name="home" size={size} color={color} solid/>
                                ),
                                headerShown: false,
                                tabBarHideOnKeyboard: true,
                            }}
                        />
                        <Tabs.Screen
                            name="play"
                            options={{
                                title: "Play",
                                tabBarIcon: ({color, size}) => (
                                    <FontAwesome5 name="dice" size={size} color={color} solid/>
                                ),
                            }}
                        />
                        <Tabs.Screen
                            name="tutorial"
                            options={{
                                title: "Tutorial",
                                tabBarIcon: ({color, size}) => (
                                    <FontAwesome5 name="book" size={size} color={color} solid/>
                                ),
                            }}
                        />
                        <Tabs.Screen
                            name="shop"
                            options={{
                                title: "Tienda",
                                tabBarIcon: ({color}) => <FontAwesome5 name="store" size={20} color={color}/>,
                            }}
                        />
                        <Tabs.Screen
                            name="bets/index"
                            options={{
                                title: "Apuestas",
                                tabBarIcon: ({color, size}) => (
                                    <FontAwesome5 name="trophy" size={size} color={color} solid/>
                                ),
                            }}
                        />
                        <Tabs.Screen
                            name="chat/index"
                            options={{
                                title: "Chat",
                                tabBarIcon: ({color, size}) => (
                                    <FontAwesome5 name="comments" size={size} color={color} solid/>
                                ),
                            }}
                        />
                        <Tabs.Screen
                            name="(auth)/sign-in"
                            options={{
                                href: null,
                                headerShown: false,
                            }}/>
                        <Tabs.Screen
                            name="(auth)/sign-up"
                            options={{
                                href: null,
                                headerShown: false,
                            }}
                        />
                        <Tabs.Screen
                            name="index"
                            options={{
                                href: null,
                                headerShown: false,
                            }}
                        />
                        <Tabs.Screen
                            name="profile"
                            options={{
                                title: "Perfil",
                                tabBarIcon: ({color, size}) => (
                                    <FontAwesome5 name="user" size={size} color={color} solid/>
                                ),
                            }}
                        />
                        <Tabs.Screen
                            name="camera"
                            options={{
                                title: "Camera",
                                href: null
                            }}/>
                        <Tabs.Screen
                            name="chat/[channelId]"
                            options={{
                                href: null,
                                headerShown: false,
                            }}
                        />
                        <Tabs.Screen
                            name="bets/[betId]"
                            options={{
                                href: null,
                                headerShown: false,
                            }}
                        />
                        <Tabs.Screen
                            name="game/[gameId]"
                            options={{
                                href: null,
                                headerShown: false,
                            }}
                        />
                        <Tabs.Screen
                            name="admin/index"
                            options={{
                                href: null,
                                headerShown: false,
                            }}
                        />
                        <Tabs.Screen
                            name="admin/[betId]/edit"
                            options={{
                                href: null,
                                headerShown: false,
                            }}
                        />
                        <Tabs.Screen
                            name="admin/new"
                            options={{
                                href: null,
                                headerShown: false,
                            }}
                        />
                    </Tabs>
                </GameProvider>
            </LoginProvider>
        </AuthProvider>
    );
}