import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_STORAGE_KEY = "tasks"; // Key to store tasks in AsyncStorage

export default function App() {
    const [task, setTask] = useState("");
    const [taskList, setTaskList] = useState([]);
    const [selectedColor, setSelectedColor] = useState("green"); // Default color is green

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
            if (storedTasks) {
                setTaskList(JSON.parse(storedTasks));
            }
        } catch (error) {
            console.error("Failed to load tasks from storage", error);
        }
    };

    const handleAddTask = async () => {
        if (task.length > 0) {
            const newTask = { text: task, color: selectedColor };
            const newTaskList = [...taskList, newTask];
            setTaskList(newTaskList);
            setTask("");
            await saveTasks(newTaskList); // Save to AsyncStorage
        }
    };

    const handleDeleteTask = async (index) => {
        const newTaskList = taskList.filter((_, i) => i !== index);
        setTaskList(newTaskList);
        await saveTasks(newTaskList); // Update AsyncStorage
    };

    const saveTasks = async (tasks) => {
        try {
            await AsyncStorage.setItem(
                TASKS_STORAGE_KEY,
                JSON.stringify(tasks)
            );
        } catch (error) {
            console.error("Failed to save tasks to storage", error);
        }
    };

    // Function to sort tasks by color priority
    const sortTasksByColor = (tasks) => {
        const colorPriority = {
            red: 1,
            yellow: 2,
            green: 3,
        };
        return tasks.sort(
            (a, b) => colorPriority[a.color] - colorPriority[b.color]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Text style={styles.title}>Today's Tasks</Text>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: selectedColor,
                            color: selectedColor === "yellow" ? "#000" : "#fff",
                        },
                    ]} // Input background color and text color
                    placeholder="Add a new task"
                    placeholderTextColor={
                        selectedColor === "yellow" ? "#000" : "#fff" // Black placeholder for yellow, white for others
                    }
                    value={task}
                    onChangeText={(text) => setTask(text)}
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddTask}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Color selection buttons */}
            <View style={styles.colorPicker}>
                <TouchableOpacity
                    style={[styles.colorButton, { backgroundColor: "red" }]}
                    onPress={() => setSelectedColor("red")}
                />
                <TouchableOpacity
                    style={[styles.colorButton, { backgroundColor: "yellow" }]}
                    onPress={() => setSelectedColor("yellow")}
                />
                <TouchableOpacity
                    style={[styles.colorButton, { backgroundColor: "green" }]}
                    onPress={() => setSelectedColor("green")}
                />
            </View>

            <ScrollView style={styles.tasksWrapper}>
                {sortTasksByColor(taskList).map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.taskItem,
                            { backgroundColor: item.color },
                        ]}
                    >
                        <Text
                            style={[
                                styles.taskText,
                                item.color === "yellow"
                                    ? styles.yellowText
                                    : styles.defaultText,
                            ]}
                        >
                            {item.text}
                        </Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteTask(index)}
                        >
                            <Text style={styles.deleteButtonText}>X</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        marginLeft: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonText: {
        fontSize: 18,
        color: "#000",
    },
    colorPicker: {
        flexDirection: "row",
        marginBottom: 20,
    },
    colorButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    tasksWrapper: {
        flex: 1,
    },
    taskItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: "black",
        padding: 5,
        borderRadius: 5,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButtonText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },
    taskText: {
        fontSize: 16,
        flex: 1,
    },
    yellowText: {
        color: "#000", // Black text for yellow background
    },
    defaultText: {
        color: "#fff", // White text for other backgrounds
    },
});
