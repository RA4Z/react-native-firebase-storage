import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from "react-native";
import { salvarPost, atualizarPost, deletarPost } from "../../servicos/firestore";
import estilos from "./estilos";
import { entradas } from "./entradas";
import { alteraDados } from "../../utils/comum";
import { IconeClicavel } from "../../componentes/IconeClicavel";
import { storage } from "../../config/firebase";
import { ref, uploadBytes } from 'firebase/storage';

const imagemGalaxia = 'https://img.freepik.com/fotos-gratis/fundo-de-galaxia-espacial_53876-93121.jpg?w=900&t=st=1685568881~exp=1685569481~hmac=9375f278421b19e7ca2260c74cb7e712c7dc0e21c45615e4db6cf761ad653c13'

export default function Post({ navigation, route }) {
    const [desabilitarEnvio, setDesabilitarEnvio] = useState(false);
    const { item } = route?.params || {};

    const [post, setPost] = useState({
        titulo: item?.titulo || "",
        fonte: item?.fonte || "",
        descricao: item?.descricao || ""
    });

    async function salvar() {
        setDesabilitarEnvio(true);
        if (item) {
            await atualizarPost(item.id, post);
        } else {
            await salvarPost(post);
        }
        
        navigation.goBack();
    }

    async function salvarImagem() {
        const downloadImagem = await fetch(imagemGalaxia)
        const blobImagem = await downloadImagem.blob()
        const imagemRef = ref(storage, 'posts/imagem.png')
        uploadBytes(imagemRef, blobImagem).then(() => {
            console.log('upload feito')
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <View style={estilos.container}>
            <Image 
                source={{ uri:'https://firebasestorage.googleapis.com/v0/b/raz-spaceapp.appspot.com/o/posts%2Fimagem.png?alt=media&token=2cc99e28-939a-42d8-bb1d-e204aae8a35f'}}
                style={{ width: 200, height: 200 }} />
            <View style={estilos.containerTitulo}>
                <Text style={estilos.titulo}>{item ? "Editar post" : "Novo Post"}</Text>
                <IconeClicavel 
                    exibir={!!item} 
                    onPress={() => {deletarPost(item.id); navigation.goBack()}}
                    iconeNome="trash-2" 
                />
            </View>
            <ScrollView style={{ width: "100%" }}>
                {entradas?.map((entrada) => (
                    <View key={entrada.id}>
                        <Text style={estilos.texto}>{entrada.label}</Text>
                        <TextInput
                            value={post[entrada.name]}
                            placeholder={entrada.label}
                            multiline={entrada.multiline}
                            onChangeText={(valor) => 
                                alteraDados(
                                    entrada.name, 
                                    valor, 
                                    post, 
                                    setPost
                                )
                            }
                            style={
                                [estilos.entrada, entrada.multiline && estilos.entradaDescricao]
                            }
                        />
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={estilos.botao} onPress={salvarImagem} disabled={desabilitarEnvio}>
                <Text style={estilos.textoBotao}>Salvar</Text>
            </TouchableOpacity>
        </View>
    );
}